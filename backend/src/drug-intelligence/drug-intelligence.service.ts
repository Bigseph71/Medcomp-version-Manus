import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Drug } from './entities/drug.entity';
import { InteractionCheck } from './entities/interaction-check.entity';
import { RuleEngineService, PatientContext, InteractionResult } from './rule-engine.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class DrugIntelligenceService {
  private readonly logger = new Logger(DrugIntelligenceService.name);

  constructor(
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
    @InjectRepository(InteractionCheck)
    private readonly interactionCheckRepository: Repository<InteractionCheck>,
    private readonly ruleEngineService: RuleEngineService,
    private readonly auditService: AuditService,
  ) {}

  // ─── Drug Search ───────────────────────────────────────────────────────────

  async searchDrugs(
    query: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: Drug[]; total: number }> {
    const [data, total] = await this.drugRepository.findAndCount({
      where: [
        { name: ILike(`%${query}%`), isActive: true },
        { internationalName: ILike(`%${query}%`), isActive: true },
        { atcCode: ILike(`%${query}%`), isActive: true },
      ],
      order: { name: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }

  // ─── Get Drug by ID ────────────────────────────────────────────────────────

  async getDrugById(drugId: string): Promise<Drug> {
    const drug = await this.drugRepository.findOne({
      where: { id: drugId, isActive: true },
    });

    if (!drug) {
      throw new NotFoundException(`Drug with ID ${drugId} not found`);
    }

    return drug;
  }

  // ─── Get Drug by Barcode ───────────────────────────────────────────────────

  async getDrugByBarcode(barcode: string): Promise<Drug> {
    const drug = await this.drugRepository.findOne({
      where: { barcode, isActive: true },
    });

    if (!drug) {
      throw new NotFoundException(`Drug with barcode ${barcode} not found`);
    }

    return drug;
  }

  // ─── Check Interactions ────────────────────────────────────────────────────

  async checkInteractions(
    userId: string,
    drugIds: string[],
    patientContext?: PatientContext,
  ): Promise<{
    interactions: InteractionResult[];
    summary: {
      totalInteractions: number;
      maxSeverity: string;
      redCount: number;
      yellowCount: number;
      greenCount: number;
    };
    disclaimer: string;
  }> {
    // Run the deterministic rule engine (Layer 1)
    const interactions = await this.ruleEngineService.checkInteractions(
      drugIds,
      patientContext,
    );

    // Calculate summary
    const redCount = interactions.filter((i) => i.severity === 'red').length;
    const yellowCount = interactions.filter((i) => i.severity === 'yellow').length;
    const greenCount = interactions.filter((i) => i.severity === 'green').length;

    const maxSeverity = redCount > 0
      ? 'red'
      : yellowCount > 0
        ? 'yellow'
        : greenCount > 0
          ? 'green'
          : 'none';

    // Save interaction check for audit trail
    const check = this.interactionCheckRepository.create({
      userId,
      drugsChecked: drugIds,
      interactionsFound: interactions,
      totalInteractions: interactions.length,
      maxSeverity,
      checkContext: patientContext as any,
      disclaimerShown: true,
    });

    await this.interactionCheckRepository.save(check);

    // Audit log
    await this.auditService.log({
      userId,
      action: 'check_interaction',
      resourceType: 'interaction_check',
      resourceId: check.id,
      details: {
        drugsChecked: drugIds.length,
        interactionsFound: interactions.length,
        maxSeverity,
      },
    });

    return {
      interactions,
      summary: {
        totalInteractions: interactions.length,
        maxSeverity,
        redCount,
        yellowCount,
        greenCount,
      },
      disclaimer:
        'This tool does not replace professional medical advice. Always consult a licensed healthcare provider.',
    };
  }

  // ─── Get Interaction History ───────────────────────────────────────────────

  async getInteractionHistory(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{ data: InteractionCheck[]; total: number }> {
    const [data, total] = await this.interactionCheckRepository.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data, total };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { DrugInteraction, InteractionSeverity, InteractionType } from './entities/drug-interaction.entity';
import { Drug } from './entities/drug.entity';

export interface PatientContext {
  age?: number;
  renalFunctionEgfr?: number;
  allergies?: string[];
  chronicConditions?: string[];
  pregnancyStatus?: boolean;
  breastfeedingStatus?: boolean;
}

export interface InteractionResult {
  interactionId: string;
  severity: 'green' | 'yellow' | 'red';
  interactionType: string;
  drugA: { id: string; name: string };
  drugB?: { id: string; name: string };
  clinicalExplanation: string;
  patientExplanation: string;
  recommendation: string;
  confidenceScore: number;
  sources: string[];
  disclaimer: string;
}

@Injectable()
export class RuleEngineService {
  private readonly logger = new Logger(RuleEngineService.name);

  private readonly DISCLAIMER =
    'This tool does not replace professional medical advice. Always consult a licensed healthcare provider.';

  constructor(
    @InjectRepository(DrugInteraction)
    private readonly interactionRepository: Repository<DrugInteraction>,
    @InjectRepository(Drug)
    private readonly drugRepository: Repository<Drug>,
  ) {}

  /**
   * Layer 1 — Deterministic Rule Engine
   * Checks all drug-drug, drug-disease, drug-age, drug-renal, and drug-food interactions
   * Returns structured, auditable results with severity scoring
   */
  async checkInteractions(
    drugIds: string[],
    patientContext?: PatientContext,
  ): Promise<InteractionResult[]> {
    const results: InteractionResult[] = [];

    // Load drugs
    const drugs = await this.drugRepository.find({
      where: { id: In(drugIds), isActive: true },
    });

    if (drugs.length < 1) {
      return results;
    }

    // 1. Check drug-drug interactions (pairwise)
    for (let i = 0; i < drugIds.length; i++) {
      for (let j = i + 1; j < drugIds.length; j++) {
        const pairInteractions = await this.checkDrugDrugInteraction(
          drugIds[i],
          drugIds[j],
          drugs,
        );
        results.push(...pairInteractions);
      }
    }

    // 2. Check patient-context interactions for each drug
    if (patientContext) {
      for (const drugId of drugIds) {
        const drug = drugs.find((d) => d.id === drugId);
        if (!drug) continue;

        // Drug-age interactions
        if (patientContext.age) {
          const ageInteractions = await this.checkDrugAgeInteraction(
            drugId,
            drug,
            patientContext.age,
          );
          results.push(...ageInteractions);
        }

        // Drug-renal interactions
        if (patientContext.renalFunctionEgfr) {
          const renalInteractions = await this.checkDrugRenalInteraction(
            drugId,
            drug,
            patientContext.renalFunctionEgfr,
          );
          results.push(...renalInteractions);
        }

        // Drug-disease interactions
        if (patientContext.chronicConditions?.length > 0) {
          const diseaseInteractions = await this.checkDrugDiseaseInteraction(
            drugId,
            drug,
            patientContext.chronicConditions,
          );
          results.push(...diseaseInteractions);
        }

        // Drug-allergy interactions
        if (patientContext.allergies?.length > 0) {
          const allergyInteractions = this.checkDrugAllergyInteraction(
            drug,
            patientContext.allergies,
          );
          results.push(...allergyInteractions);
        }

        // Drug-pregnancy interactions
        if (patientContext.pregnancyStatus) {
          const pregnancyInteractions = await this.checkDrugPregnancyInteraction(
            drugId,
            drug,
          );
          results.push(...pregnancyInteractions);
        }
      }
    }

    // 3. Check drug-food interactions for all drugs
    for (const drugId of drugIds) {
      const drug = drugs.find((d) => d.id === drugId);
      if (!drug) continue;

      const foodInteractions = await this.checkDrugFoodInteraction(drugId, drug);
      results.push(...foodInteractions);
    }

    // Sort by severity (red first, then yellow, then green)
    const severityOrder = { red: 0, yellow: 1, green: 2 };
    results.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    return results;
  }

  // ─── Drug-Drug Interaction Check ───────────────────────────────────────────

  private async checkDrugDrugInteraction(
    drugAId: string,
    drugBId: string,
    drugs: Drug[],
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: [
        { drugAId, drugBId, interactionType: InteractionType.DRUG_DRUG, isActive: true },
        { drugAId: drugBId, drugBId: drugAId, interactionType: InteractionType.DRUG_DRUG, isActive: true },
      ],
    });

    const drugA = drugs.find((d) => d.id === drugAId);
    const drugB = drugs.find((d) => d.id === drugBId);

    return interactions.map((interaction) => ({
      interactionId: interaction.id,
      severity: interaction.severity as 'green' | 'yellow' | 'red',
      interactionType: interaction.interactionType,
      drugA: { id: drugAId, name: drugA?.name || 'Unknown' },
      drugB: { id: drugBId, name: drugB?.name || 'Unknown' },
      clinicalExplanation: interaction.clinicalExplanation,
      patientExplanation: interaction.patientExplanation,
      recommendation: interaction.recommendation,
      confidenceScore: Number(interaction.confidenceScore),
      sources: interaction.sources as string[],
      disclaimer: this.DISCLAIMER,
    }));
  }

  // ─── Drug-Age Interaction Check ────────────────────────────────────────────

  private async checkDrugAgeInteraction(
    drugId: string,
    drug: Drug,
    age: number,
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: {
        drugAId: drugId,
        interactionType: InteractionType.DRUG_AGE,
        isActive: true,
      },
    });

    return interactions
      .filter((i) => {
        if (i.ageMin && age < i.ageMin) return false;
        if (i.ageMax && age > i.ageMax) return false;
        // If no age bounds set, check if patient is elderly (>65)
        if (!i.ageMin && !i.ageMax && age >= 65) return true;
        return true;
      })
      .map((interaction) => ({
        interactionId: interaction.id,
        severity: interaction.severity as 'green' | 'yellow' | 'red',
        interactionType: interaction.interactionType,
        drugA: { id: drugId, name: drug.name },
        clinicalExplanation: interaction.clinicalExplanation,
        patientExplanation: interaction.patientExplanation,
        recommendation: interaction.recommendation,
        confidenceScore: Number(interaction.confidenceScore),
        sources: interaction.sources as string[],
        disclaimer: this.DISCLAIMER,
      }));
  }

  // ─── Drug-Renal Interaction Check ──────────────────────────────────────────

  private async checkDrugRenalInteraction(
    drugId: string,
    drug: Drug,
    egfr: number,
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: {
        drugAId: drugId,
        interactionType: InteractionType.DRUG_RENAL,
        isActive: true,
      },
    });

    return interactions
      .filter((i) => !i.renalThreshold || egfr <= Number(i.renalThreshold))
      .map((interaction) => ({
        interactionId: interaction.id,
        severity: interaction.severity as 'green' | 'yellow' | 'red',
        interactionType: interaction.interactionType,
        drugA: { id: drugId, name: drug.name },
        clinicalExplanation: interaction.clinicalExplanation,
        patientExplanation: interaction.patientExplanation,
        recommendation: interaction.recommendation,
        confidenceScore: Number(interaction.confidenceScore),
        sources: interaction.sources as string[],
        disclaimer: this.DISCLAIMER,
      }));
  }

  // ─── Drug-Disease Interaction Check ────────────────────────────────────────

  private async checkDrugDiseaseInteraction(
    drugId: string,
    drug: Drug,
    conditions: string[],
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: {
        drugAId: drugId,
        interactionType: InteractionType.DRUG_DISEASE,
        isActive: true,
      },
    });

    const normalizedConditions = conditions.map((c) => c.toLowerCase().trim());

    return interactions
      .filter((i) =>
        i.conditionTrigger &&
        normalizedConditions.some((c) =>
          c.includes(i.conditionTrigger.toLowerCase()) ||
          i.conditionTrigger.toLowerCase().includes(c),
        ),
      )
      .map((interaction) => ({
        interactionId: interaction.id,
        severity: interaction.severity as 'green' | 'yellow' | 'red',
        interactionType: interaction.interactionType,
        drugA: { id: drugId, name: drug.name },
        clinicalExplanation: interaction.clinicalExplanation,
        patientExplanation: interaction.patientExplanation,
        recommendation: interaction.recommendation,
        confidenceScore: Number(interaction.confidenceScore),
        sources: interaction.sources as string[],
        disclaimer: this.DISCLAIMER,
      }));
  }

  // ─── Drug-Allergy Check ────────────────────────────────────────────────────

  private checkDrugAllergyInteraction(
    drug: Drug,
    allergies: string[],
  ): InteractionResult[] {
    const normalizedAllergies = allergies.map((a) => a.toLowerCase().trim());
    const results: InteractionResult[] = [];

    for (const substance of drug.activeSubstances) {
      if (normalizedAllergies.some((a) => substance.toLowerCase().includes(a) || a.includes(substance.toLowerCase()))) {
        results.push({
          interactionId: `allergy-${drug.id}-${substance}`,
          severity: 'red',
          interactionType: InteractionType.DRUG_ALLERGY,
          drugA: { id: drug.id, name: drug.name },
          clinicalExplanation: `Patient has a documented allergy to ${substance}. ${drug.name} contains this active substance and is contraindicated.`,
          patientExplanation: `Vous êtes allergique à ${substance}. Ce médicament (${drug.name}) contient cette substance et ne doit pas être pris.`,
          recommendation: `Ne pas administrer ${drug.name}. Rechercher une alternative thérapeutique ne contenant pas ${substance}.`,
          confidenceScore: 1.0,
          sources: ['Patient allergy record'],
          disclaimer: this.DISCLAIMER,
        });
      }
    }

    return results;
  }

  // ─── Drug-Pregnancy Check ──────────────────────────────────────────────────

  private async checkDrugPregnancyInteraction(
    drugId: string,
    drug: Drug,
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: {
        drugAId: drugId,
        interactionType: InteractionType.DRUG_PREGNANCY,
        isActive: true,
      },
    });

    return interactions.map((interaction) => ({
      interactionId: interaction.id,
      severity: interaction.severity as 'green' | 'yellow' | 'red',
      interactionType: interaction.interactionType,
      drugA: { id: drugId, name: drug.name },
      clinicalExplanation: interaction.clinicalExplanation,
      patientExplanation: interaction.patientExplanation,
      recommendation: interaction.recommendation,
      confidenceScore: Number(interaction.confidenceScore),
      sources: interaction.sources as string[],
      disclaimer: this.DISCLAIMER,
    }));
  }

  // ─── Drug-Food Interaction Check ───────────────────────────────────────────

  private async checkDrugFoodInteraction(
    drugId: string,
    drug: Drug,
  ): Promise<InteractionResult[]> {
    const interactions = await this.interactionRepository.find({
      where: {
        drugAId: drugId,
        interactionType: InteractionType.DRUG_FOOD,
        isActive: true,
      },
    });

    return interactions.map((interaction) => ({
      interactionId: interaction.id,
      severity: interaction.severity as 'green' | 'yellow' | 'red',
      interactionType: interaction.interactionType,
      drugA: { id: drugId, name: drug.name },
      clinicalExplanation: interaction.clinicalExplanation,
      patientExplanation: interaction.patientExplanation,
      recommendation: interaction.recommendation,
      confidenceScore: Number(interaction.confidenceScore),
      sources: interaction.sources as string[],
      disclaimer: this.DISCLAIMER,
    }));
  }
}

import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { PillboxService, CreateMedicationDto, UpdateDoseDto } from './pillbox.service';
import { MedicationStatus } from './entities/patient-medication.entity';

@ApiTags('Pillbox')
@Controller('pillbox')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class PillboxController {
  constructor(private readonly pillboxService: PillboxService) {}

  // ─── Medication Management ─────────────────────────────────────────────────

  @Post('medications')
  @ApiOperation({ summary: 'Add a new medication to the pillbox' })
  @ApiResponse({ status: 201, description: 'Medication added successfully' })
  async addMedication(@Request() req: any, @Body() dto: CreateMedicationDto) {
    return this.pillboxService.addMedication(req.user.id, dto);
  }

  @Get('medications')
  @ApiOperation({ summary: 'Get all user medications' })
  @ApiQuery({ name: 'status', required: false, enum: MedicationStatus })
  async getMedications(
    @Request() req: any,
    @Query('status') status?: MedicationStatus,
  ) {
    return this.pillboxService.getUserMedications(req.user.id, status);
  }

  @Get('medications/:id')
  @ApiOperation({ summary: 'Get medication details' })
  @ApiParam({ name: 'id', description: 'Medication UUID' })
  async getMedication(@Request() req: any, @Param('id') id: string) {
    return this.pillboxService.getMedicationById(req.user.id, id);
  }

  @Put('medications/:id')
  @ApiOperation({ summary: 'Update a medication' })
  async updateMedication(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreateMedicationDto>,
  ) {
    return this.pillboxService.updateMedication(req.user.id, id, dto);
  }

  @Delete('medications/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a medication (soft delete)' })
  async deleteMedication(@Request() req: any, @Param('id') id: string) {
    return this.pillboxService.deleteMedication(req.user.id, id);
  }

  // ─── Dose Tracking ────────────────────────────────────────────────────────

  @Get('doses/today')
  @ApiOperation({ summary: 'Get today\'s dose schedule' })
  async getTodayDoses(@Request() req: any) {
    return this.pillboxService.getTodayDoses(req.user.id);
  }

  @Get('doses')
  @ApiOperation({ summary: 'Get doses by date range' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getDoses(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.pillboxService.getDosesByDateRange(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }

  @Put('doses/:id')
  @ApiOperation({ summary: 'Update dose status (taken, missed, skipped, snoozed)' })
  async updateDose(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateDoseDto,
  ) {
    return this.pillboxService.updateDoseStatus(req.user.id, id, dto);
  }

  // ─── Adherence Analytics ───────────────────────────────────────────────────

  @Get('adherence')
  @ApiOperation({ summary: 'Get adherence statistics' })
  @ApiQuery({ name: 'periodType', required: false, enum: ['daily', 'weekly', 'monthly'] })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  async getAdherence(
    @Request() req: any,
    @Query('periodType') periodType: string = 'daily',
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.pillboxService.getAdherenceStats(
      req.user.id,
      periodType,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  // ─── Reports ───────────────────────────────────────────────────────────────

  @Get('reports/adherence')
  @ApiOperation({ summary: 'Generate adherence report (PDF-ready data)' })
  @ApiQuery({ name: 'startDate', required: true })
  @ApiQuery({ name: 'endDate', required: true })
  async getAdherenceReport(
    @Request() req: any,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.pillboxService.generateAdherenceReport(
      req.user.id,
      new Date(startDate),
      new Date(endDate),
    );
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DrugIntelligenceService } from './drug-intelligence.service';

class CheckInteractionsDto {
  drugIds: string[];
  patientContext?: {
    age?: number;
    renalFunctionEgfr?: number;
    allergies?: string[];
    chronicConditions?: string[];
    pregnancyStatus?: boolean;
    breastfeedingStatus?: boolean;
  };
}

@ApiTags('Drug Intelligence')
@Controller('drugs')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class DrugIntelligenceController {
  constructor(private readonly drugIntelligenceService: DrugIntelligenceService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search drugs by name, international name, or ATC code' })
  @ApiQuery({ name: 'q', description: 'Search query' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of matching drugs' })
  async searchDrugs(
    @Query('q') query: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.drugIntelligenceService.searchDrugs(query, page, limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drug details by ID' })
  @ApiParam({ name: 'id', description: 'Drug UUID' })
  @ApiResponse({ status: 200, description: 'Drug details' })
  @ApiResponse({ status: 404, description: 'Drug not found' })
  async getDrug(@Param('id') id: string) {
    return this.drugIntelligenceService.getDrugById(id);
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Get drug by barcode' })
  @ApiParam({ name: 'barcode', description: 'Drug barcode' })
  @ApiResponse({ status: 200, description: 'Drug details' })
  @ApiResponse({ status: 404, description: 'Drug not found' })
  async getDrugByBarcode(@Param('barcode') barcode: string) {
    return this.drugIntelligenceService.getDrugByBarcode(barcode);
  }

  @Post('check-interactions')
  @ApiOperation({
    summary: 'Check drug interactions',
    description:
      'Checks all drug-drug, drug-disease, drug-age, drug-renal, drug-food, and drug-allergy interactions. ' +
      'Returns structured results with severity scoring and clinical explanations. ' +
      'DISCLAIMER: This tool does not replace professional medical advice.',
  })
  @ApiResponse({
    status: 200,
    description: 'Interaction check results with severity summary',
  })
  async checkInteractions(
    @Request() req: any,
    @Body() dto: CheckInteractionsDto,
  ) {
    return this.drugIntelligenceService.checkInteractions(
      req.user.id,
      dto.drugIds,
      dto.patientContext,
    );
  }

  @Get('interactions/history')
  @ApiOperation({ summary: 'Get interaction check history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getInteractionHistory(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.drugIntelligenceService.getInteractionHistory(
      req.user.id,
      page,
      limit,
    );
  }
}

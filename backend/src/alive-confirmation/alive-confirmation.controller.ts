import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AliveConfirmationService } from './alive-confirmation.service';

@ApiTags('Alive Confirmation')
@Controller('alive')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class AliveConfirmationController {
  constructor(private readonly aliveService: AliveConfirmationService) {}

  // ─── Configuration ─────────────────────────────────────────────────────────

  @Get('config')
  @ApiOperation({ summary: 'Get alive confirmation configuration' })
  async getConfig(@Request() req: any) {
    return this.aliveService.getConfiguration(req.user.id);
  }

  @Put('config')
  @ApiOperation({ summary: 'Update alive confirmation configuration' })
  async updateConfig(@Request() req: any, @Body() dto: any) {
    return this.aliveService.updateConfiguration(req.user.id, dto);
  }

  // ─── Alive Confirmation ────────────────────────────────────────────────────

  @Post('confirm')
  @ApiOperation({
    summary: 'Confirm alive status ("I am OK" button)',
    description: 'User presses the "I am OK" button to confirm they are safe. ' +
      'Optionally includes device info (battery, GPS, network status).',
  })
  @ApiResponse({ status: 201, description: 'Alive status confirmed' })
  async confirmAlive(
    @Request() req: any,
    @Body() body: {
      batteryLevel?: number;
      gpsLatitude?: number;
      gpsLongitude?: number;
      gpsAccuracy?: number;
      networkStatus?: string;
    },
  ) {
    return this.aliveService.confirmAlive(req.user.id, body);
  }

  @Get('status')
  @ApiOperation({ summary: 'Get current alive status and next check due time' })
  async getStatus(@Request() req: any) {
    return this.aliveService.getAliveStatus(req.user.id);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get alive check history' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getHistory(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 30,
  ) {
    return this.aliveService.getAliveHistory(req.user.id, page, limit);
  }

  // ─── Emergency Contacts ────────────────────────────────────────────────────

  @Get('contacts')
  @ApiOperation({ summary: 'Get emergency contacts' })
  async getContacts(@Request() req: any) {
    return this.aliveService.getEmergencyContacts(req.user.id);
  }

  @Post('contacts')
  @ApiOperation({ summary: 'Add an emergency contact' })
  async addContact(@Request() req: any, @Body() dto: any) {
    return this.aliveService.addEmergencyContact(req.user.id, dto);
  }

  @Put('contacts/:id')
  @ApiOperation({ summary: 'Update an emergency contact' })
  async updateContact(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: any,
  ) {
    return this.aliveService.updateEmergencyContact(req.user.id, id, dto);
  }

  @Delete('contacts/:id')
  @ApiOperation({ summary: 'Delete an emergency contact' })
  async deleteContact(@Request() req: any, @Param('id') id: string) {
    return this.aliveService.deleteEmergencyContact(req.user.id, id);
  }
}

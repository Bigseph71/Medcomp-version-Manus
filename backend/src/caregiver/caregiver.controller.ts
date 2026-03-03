import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, Request, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CaregiverService } from './caregiver.service';

@ApiTags('Caregiver')
@Controller('caregiver')
@UseGuards(AuthGuard('jwt'))
@ApiBearerAuth('JWT-auth')
export class CaregiverController {
  constructor(private readonly caregiverService: CaregiverService) {}

  @Post('invite')
  @ApiOperation({ summary: 'Create a caregiver invitation (patient sends to caregiver)' })
  @ApiResponse({ status: 201, description: 'Invitation created' })
  async createInvitation(
    @Request() req: any,
    @Body() body: { caregiverEmail: string; permissions?: string[] },
  ) {
    return this.caregiverService.createInvitation(
      req.user.id,
      body.caregiverEmail,
      body.permissions,
    );
  }

  @Post('accept/:token')
  @ApiOperation({ summary: 'Accept a caregiver invitation' })
  async acceptInvitation(
    @Request() req: any,
    @Param('token') token: string,
  ) {
    return this.caregiverService.acceptInvitation(req.user.id, token);
  }

  @Get('my-caregivers')
  @ApiOperation({ summary: 'Get caregivers linked to current patient' })
  async getMyCaregivers(@Request() req: any) {
    return this.caregiverService.getPatientCaregivers(req.user.id);
  }

  @Get('my-patients')
  @ApiOperation({ summary: 'Get patients linked to current caregiver' })
  async getMyPatients(@Request() req: any) {
    return this.caregiverService.getCaregiverPatients(req.user.id);
  }

  @Put(':id/permissions')
  @ApiOperation({ summary: 'Update caregiver permissions' })
  async updatePermissions(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { permissions: string[] },
  ) {
    return this.caregiverService.updatePermissions(req.user.id, id, body.permissions);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove a caregiver relationship' })
  async removeRelationship(@Request() req: any, @Param('id') id: string) {
    return this.caregiverService.removeRelationship(req.user.id, id);
  }
}

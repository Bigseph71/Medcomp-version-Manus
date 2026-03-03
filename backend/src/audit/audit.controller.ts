import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('Audit')
@Controller('audit')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@ApiBearerAuth('JWT-auth')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get('logs/me')
  @ApiOperation({ summary: 'Get current user audit logs' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getMyLogs(
    @Request() req: any,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.auditService.getLogsByUser(req.user.id, page, limit);
  }

  @Get('logs')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all audit logs (admin only)' })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getAllLogs(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    if (startDate && endDate) {
      return this.auditService.getLogsByDateRange(
        new Date(startDate),
        new Date(endDate),
        page,
        limit,
      );
    }
    return this.auditService.getLogsByDateRange(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      new Date(),
      page,
      limit,
    );
  }

  @Get('security-events')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get security events (admin only)' })
  async getSecurityEvents(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.auditService.getSecurityEvents(page, limit);
  }

  @Get('incidents')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get incidents (admin only)' })
  @ApiQuery({ name: 'status', required: false })
  async getIncidents(
    @Query('status') status?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.auditService.getIncidents(status, page, limit);
  }

  @Post('incidents')
  @Roles(UserRole.ADMIN, UserRole.HEALTHCARE_PROFESSIONAL)
  @ApiOperation({ summary: 'Report an incident' })
  async createIncident(@Request() req: any, @Body() body: any) {
    return this.auditService.createIncident({
      ...body,
      reportedBy: req.user.id,
    });
  }

  @Put('incidents/:id/resolve')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Resolve an incident' })
  async resolveIncident(
    @Param('id') id: string,
    @Body('resolutionNotes') resolutionNotes: string,
  ) {
    return this.auditService.resolveIncident(id, resolutionNotes);
  }
}

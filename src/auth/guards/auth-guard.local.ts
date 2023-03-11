import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../auth.constants';

export class AuthGuardLocal extends AuthGuard(STRATEGY_NAME.local) {}

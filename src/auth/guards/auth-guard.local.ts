import { AuthGuard } from '@nestjs/passport';
import { StrategyName } from '../auth.constants';

export class AuthGuardLocal extends AuthGuard(StrategyName.local) {}

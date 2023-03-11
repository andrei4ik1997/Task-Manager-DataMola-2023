import { AuthGuard } from '@nestjs/passport';
import { StrategyName } from '../auth.constants';

export class AuthGuardJwt extends AuthGuard(StrategyName.jwt) {}

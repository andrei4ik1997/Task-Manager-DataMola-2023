import { AuthGuard } from '@nestjs/passport';
import { AuthNamespace } from '../auth.namespace';

export class AuthGuardJwt extends AuthGuard(AuthNamespace.StrategyName.jwt) {}

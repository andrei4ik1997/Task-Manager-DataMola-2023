import { AuthGuard } from '@nestjs/passport';
import { AuthNamespace } from '../auth.namespace';

export class AuthGuardLocal extends AuthGuard(
  AuthNamespace.StrategyName.local,
) {}

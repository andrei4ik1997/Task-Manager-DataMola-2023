import { AuthGuard } from '@nestjs/passport';
import { STRATEGY_NAME } from '../auth.constants';

export class AuthGuardJwt extends AuthGuard(STRATEGY_NAME.jwt) {}

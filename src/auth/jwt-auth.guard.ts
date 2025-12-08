import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard que protege endpoints usando JWT
 * Usa la estrategia JWT de Passport internamente
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    canActivate(context: ExecutionContext) {
        // Aquí puedes agregar lógica personalizada antes de la validación
        return super.canActivate(context);
    }
}

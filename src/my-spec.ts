import {injectable} from '@loopback/core';
import {
  asSpecEnhancer,
  mergeOpenAPISpec,
  mergeSecuritySchemeToSpec,
  OASEnhancer,
  OpenApiSpec,
} from '@loopback/rest';

@injectable(asSpecEnhancer)
export class JwtAuthSpecEnhancer implements OASEnhancer {
  name = 'apiKey';

  modifySpec(spec: OpenApiSpec): OpenApiSpec {
    const securitySchemeSpec = mergeSecuritySchemeToSpec(
      spec,
      'authorization_token',
      {
        type: 'apiKey',
        name: 'Authorization',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        description: 'JWT Token for Authorization (Bearer)',
      },
    );
    const securitySpec = mergeOpenAPISpec(securitySchemeSpec, {
      security: [
        {
          ['authorization_token']: ['Authorization'],
        },
      ],
    });
    return securitySpec;
  }
}

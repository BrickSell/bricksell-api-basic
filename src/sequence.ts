/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AUTHENTICATION_STRATEGY_NOT_FOUND,
  AuthenticateFn,
  AuthenticationBindings,
  USER_PROFILE_NOT_FOUND,
} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {
  ExpressRequestHandler,
  FindRoute,
  InvokeMethod,
  InvokeMiddleware,
  ParseParams,
  Reject,
  RequestContext,
  Send,
  SequenceActions,
  SequenceHandler,
} from '@loopback/rest';
import cors from 'cors';
import {BricksellActiveRoleBinding} from './auth/role/middleware';

const middlewareList: ExpressRequestHandler[] = [cors()];

export class MySequence implements SequenceHandler {
  /**
   * Optional invoker for registered middleware in a chain.
   * To be injected via SequenceActions.INVOKE_MIDDLEWARE.
   */
  @inject(SequenceActions.INVOKE_MIDDLEWARE, {optional: true})
  protected invokeMiddleware: InvokeMiddleware = () => false;

  constructor(
    // ... Other injections
    @inject(SequenceActions.FIND_ROUTE) protected findRoute: FindRoute,
    @inject(SequenceActions.PARSE_PARAMS) protected parseParams: ParseParams,
    @inject(SequenceActions.INVOKE_METHOD) protected invoke: InvokeMethod,
    @inject(SequenceActions.SEND) public send: Send,
    @inject(SequenceActions.REJECT) public reject: Reject,
    @inject(AuthenticationBindings.AUTH_ACTION)
    protected authenticateRequest: AuthenticateFn,
    @inject(BricksellActiveRoleBinding)
    private bricksellRole: (context: RequestContext) => Promise<void>,
  ) {}

  async handle(context: RequestContext) {
    try {
      const {request, response} = context;
      //Resolve cors issue https://github.com/loopbackio/loopback-next/issues/5368
      const finished = await this.invokeMiddleware(context, middlewareList);
      if (finished) return;

      const route = this.findRoute(request);

      await this.authenticateRequest(request);

      await this.bricksellRole(context);

      // TODO: Remove * when access-control allow origin was implemented with correct values
      response.setHeader(
        'Access-Control-Allow-Methods',
        'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      );
      response.setHeader(
        'Access-Control-Allow-Headers',
        'Origin, Content-Type, X-Auth-Token',
      );
      response.setHeader('Access-Control-Allow-Origin', '*');

      // Authentication successful, proceed to invoke controller
      const args = await this.parseParams(request, route);
      const result = await this.invoke(route, args);
      //In order to control the Http.RESPONSE the body with a content type is required. So the sequence was modified to validate these cases.
      //See https://github.com/strongloop/loopback-next/issues/5168
      if (response.getHeader('Content-Type')) {
        response.send(result);
        return;
      }
      // TODO: Remove this line when WebApp gateway is created
      // response.setHeader('Access-Control-Allow-Origin', '*');
      this.send(response, result);
    } catch (error) {
      if (
        (error as any).code === AUTHENTICATION_STRATEGY_NOT_FOUND ||
        (error as any).code === USER_PROFILE_NOT_FOUND
      ) {
        Object.assign(error as any, {
          name: 'Unauthorized',
          statusCode: 401 /* Unauthorized */,
          message: 'User is not authorized',
        });
      }

      this.reject(context, error as any);
      return;
    }
  }
}

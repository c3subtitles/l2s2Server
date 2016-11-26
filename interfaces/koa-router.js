declare class KoaRouter$RouterContext extends Koa$Context {
  params: Object;
}
declare class KoaRouter$Router {
  static constructor(options?: {
    prefix?: string,
  }): KoaRouter$Router;
  static (options?: {
    prefix?: string,
  }): KoaRouter$Router;
  all(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  all(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  propfind(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  propfind(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  proppatch(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  proppatch(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  report(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  report(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  options(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  options(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  delete(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  delete(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  get(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  get(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  patch(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  patch(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  post(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  post(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  prefix(prefix: string): this;
  put(name: string, route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  put(route: string, handler: (ctx: KoaRouter$RouterContext, next: Function) => ?Promise<*>): this;
  routes(): Function;
  use(...middlewares: ((ctx: Koa$Context, next: Function) => ?Promise<*>)[]): this;
  use(path: string|string[], ...middlewares: ((ctx: Koa$Context, next: Function) => ?Promise<*>)[]): this;
  allowedMethods(options?: {
    throw?: bool,
    notImplemented?: Function,
    methodNotAllowed?: Function,
  }): Function;
  param(param: string, middleware: Function): this;
  redirect(source: string, destination: string, code?: number): this;
  route(name: string): any|false;
  url(name: string, params?: any): string|Error;
  url(path: string, params: Object): string;
}

declare module 'koa-router' {
  declare var exports: Class<KoaRouter$Router>;
}

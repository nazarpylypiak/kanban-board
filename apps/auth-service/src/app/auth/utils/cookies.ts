import { FastifyReply } from 'fastify';

export const setRefreshCookie = (
  res: FastifyReply,
  token: string,
  opts: { isProd: boolean }
) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: opts.isProd,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
};

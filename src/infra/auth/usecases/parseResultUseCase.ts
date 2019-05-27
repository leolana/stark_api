const parseResultUseCase = (result: string) => {
  const parsed = JSON.parse(result);

  return {
    accessToken: parsed.access_token,
    refreshToken: parsed.refresh_token,
  };
};

export default parseResultUseCase;

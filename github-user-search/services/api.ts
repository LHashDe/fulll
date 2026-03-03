type StandardApiError = {
  message: string;
  status: number;
};

function isStandardApiError(
  error: Record<string, unknown>,
): error is StandardApiError {
  return Object.hasOwn(error, "statusCode") && Object.hasOwn(error, "message");
}

type ApiError = {
  message: string;
  status: number;
};

export type ValidApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
};

interface Options {
  blob?: boolean;
}

export async function getValidApiResponse<T>(
  response: Response,
  options?: Options,
): Promise<ValidApiResponse<T>> {
  try {
    if (!response.ok) {
      const error = await response.json();

      if (isStandardApiError(error)) {
        return {
          data: null,
          error: error,
        };
      }

      return {
        data: null,
        error: {
          message: error.message || "An unknown error occurred",
          status: error.statusCode || response.status,
        },
      };
    }

    if (response.status === 204) {
      return {
        data: null,
        error: null,
      };
    }

    if (options?.blob) {
      const blob = await response.blob();
      return {
        data: blob as T,
        error: null,
      };
    }

    const data = await response.json();
    return {
      data: data,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: {
        message: error instanceof Error ? error.message : 'An unknown error occurred',
        status: response.status || 500
      },
    };
  }
}

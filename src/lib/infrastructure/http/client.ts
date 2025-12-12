/**
 * Client HTTP robuste et reutilisable
 * Centralise les appels API avec gestion d'erreurs, retry et typage
 */

export interface HttpClientConfig {
	baseUrl?: string;
	defaultHeaders?: Record<string, string>;
	timeout?: number;
	retryAttempts?: number;
	retryDelay?: number;
}

export interface HttpResponse<T> {
	data: T;
	status: number;
	headers: Headers;
	ok: boolean;
}

export interface HttpError {
	message: string;
	status?: number;
	code?: string;
}

export class HttpClientError extends Error {
	public status?: number;
	public code?: string;

	constructor(error: HttpError) {
		super(error.message);
		this.name = "HttpClientError";
		this.status = error.status;
		this.code = error.code;
	}
}

const DEFAULT_CONFIG: HttpClientConfig = {
	baseUrl: "",
	defaultHeaders: {
		"Content-Type": "application/json",
	},
	timeout: 30000,
	retryAttempts: 0,
	retryDelay: 1000,
};

class HttpClient {
	private config: HttpClientConfig;

	constructor(config: HttpClientConfig = {}) {
		this.config = { ...DEFAULT_CONFIG, ...config };
	}

	/**
	 * Execute une requete avec gestion des erreurs et retry
	 */
	private async request<T>(
		url: string,
		options: RequestInit = {},
	): Promise<HttpResponse<T>> {
		const fullUrl = `${this.config.baseUrl}${url}`;
		const headers = {
			...this.config.defaultHeaders,
			...options.headers,
		};

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

		let lastError: Error | null = null;
		const attempts = (this.config.retryAttempts || 0) + 1;

		for (let attempt = 1; attempt <= attempts; attempt++) {
			try {
				const response = await fetch(fullUrl, {
					...options,
					headers,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				if (!response.ok) {
					let errorData: { error?: string; message?: string } = {};
					try {
						errorData = await response.json();
					} catch {
						// Ignore JSON parse errors
					}

					throw new HttpClientError({
						message:
							errorData.error ||
							errorData.message ||
							`HTTP Error: ${response.status}`,
						status: response.status,
						code: response.status === 401 ? "UNAUTHORIZED" : undefined,
					});
				}

				const contentType = response.headers.get("content-type");
				let data: T;

				if (contentType?.includes("application/json")) {
					data = await response.json();
				} else if (contentType?.includes("text/event-stream")) {
					data = response as unknown as T;
				} else {
					data = (await response.text()) as unknown as T;
				}

				return {
					data,
					status: response.status,
					headers: response.headers,
					ok: response.ok,
				};
			} catch (error) {
				lastError = error as Error;

				if (error instanceof HttpClientError) {
					throw error;
				}

				if ((error as Error).name === "AbortError") {
					throw new HttpClientError({
						message: "Request timeout",
						code: "TIMEOUT",
					});
				}

				if (attempt < attempts) {
					await this.delay(this.config.retryDelay || 1000);
				}
			}
		}

		throw new HttpClientError({
			message: lastError?.message || "Request failed",
			code: "NETWORK_ERROR",
		});
	}

	private delay(ms: number): Promise<void> {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}

	async get<T>(url: string, options?: RequestInit): Promise<HttpResponse<T>> {
		return this.request<T>(url, { ...options, method: "GET" });
	}

	async post<T>(
		url: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<HttpResponse<T>> {
		return this.request<T>(url, {
			...options,
			method: "POST",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async put<T>(
		url: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<HttpResponse<T>> {
		return this.request<T>(url, {
			...options,
			method: "PUT",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async patch<T>(
		url: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<HttpResponse<T>> {
		return this.request<T>(url, {
			...options,
			method: "PATCH",
			body: body ? JSON.stringify(body) : undefined,
		});
	}

	async delete<T>(
		url: string,
		options?: RequestInit,
	): Promise<HttpResponse<T>> {
		return this.request<T>(url, { ...options, method: "DELETE" });
	}

	/**
	 * Requete POST avec streaming (Server-Sent Events)
	 * Retourne la Response brute pour permettre le streaming
	 */
	async postStream(
		url: string,
		body?: unknown,
		options?: RequestInit,
	): Promise<Response> {
		const fullUrl = `${this.config.baseUrl}${url}`;
		const headers = {
			...this.config.defaultHeaders,
			...options?.headers,
		};

		const response = await fetch(fullUrl, {
			...options,
			method: "POST",
			headers,
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			let errorData: { error?: string; message?: string } = {};
			try {
				errorData = await response.json();
			} catch {
				// Ignore JSON parse errors
			}

			throw new HttpClientError({
				message:
					errorData.error ||
					errorData.message ||
					`HTTP Error: ${response.status}`,
				status: response.status,
				code: response.status === 429 ? "GUEST_LIMIT_REACHED" : undefined,
			});
		}

		return response;
	}
}

export const httpClient = new HttpClient();

export default httpClient;

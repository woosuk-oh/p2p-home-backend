export abstract class ApiService {
    static async fetchFromExternalApi(url: string, options?: RequestInit) {
        try {
            const response = await fetch(url, options);
            const result = await response.json();

            if (!response.ok) {
                console.log('result', result);
                throw new Error(`HTTP external api error! response: ${JSON.stringify(result)} request api url: ${response.url}`);
            }

            return result;
        } catch (e) {
            console.error("API fetch error: ", e);
            throw e;
        }
    }
}
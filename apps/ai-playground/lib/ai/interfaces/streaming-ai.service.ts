export interface IStreamingAIService<Request> {
  generateStream(request: Request): Promise<ReadableStream<Uint8Array>>;
}

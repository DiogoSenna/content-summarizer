import { init, Tiktoken } from "tiktoken/lite/init";
import wasm from "../../node_modules/tiktoken/lite/tiktoken_bg.wasm";
import model from "tiktoken/encoders/cl100k_base.json";

export class TokenCalculatorService {
	async execute(text: string): Promise<number> {
		await init((imports) => WebAssembly.instantiate(wasm, imports));
		const encoder = new Tiktoken(model.bpe_ranks, model.special_tokens, model.pat_str);
		const tokens = encoder.encode(text);
		encoder.free();

		return tokens.length;
	}
}

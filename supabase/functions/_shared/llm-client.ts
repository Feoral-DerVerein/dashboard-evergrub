// Shared LLM Client for Negentropy AI Edge Functions
// Supports OpenAI, Anthropic, and Google Gemini APIs

export type LLMProvider = 'openai' | 'anthropic' | 'gemini'

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMOptions {
  model?: string
  maxTokens?: number
  temperature?: number
  stream?: boolean
}

export interface LLMResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
}

/**
 * Unified LLM Client
 * Automatically detects and uses available API keys
 */
export class LLMClient {
  private provider: LLMProvider
  private apiKey: string
  private defaultModel: string

  constructor() {
    const openaiKey = Deno.env.get('OPENAI_API_KEY')
    const anthropicKey = Deno.env.get('ANTHROPIC_API_KEY')
    const geminiKey = Deno.env.get('GEMINI_API_KEY')
    const envProvider = Deno.env.get('LLM_PROVIDER') as LLMProvider | undefined

    // Priority: explicit provider > Gemini (cheapest) > OpenAI > Anthropic
    if (envProvider === 'gemini' && geminiKey) {
      this.provider = 'gemini'
      this.apiKey = geminiKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'gemini-1.5-flash-latest'
    } else if (envProvider === 'openai' && openaiKey) {
      this.provider = 'openai'
      this.apiKey = openaiKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'gpt-4o-mini'
    } else if (envProvider === 'anthropic' && anthropicKey) {
      this.provider = 'anthropic'
      this.apiKey = anthropicKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'claude-3-5-sonnet-20241022'
    } else if (geminiKey) {
      this.provider = 'gemini'
      this.apiKey = geminiKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'gemini-1.5-flash-latest'
    } else if (openaiKey) {
      this.provider = 'openai'
      this.apiKey = openaiKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'gpt-4o-mini'
    } else if (anthropicKey) {
      this.provider = 'anthropic'
      this.apiKey = anthropicKey
      this.defaultModel = Deno.env.get('LLM_MODEL') || 'claude-3-5-sonnet-20241022'
    } else {
      throw new Error('No LLM API key found. Please set GEMINI_API_KEY, OPENAI_API_KEY, or ANTHROPIC_API_KEY')
    }

    console.log(`[LLM Client] Initialized with provider: ${this.provider}, model: ${this.defaultModel}`)
  }

  /**
   * Chat completion
   */
  async chat(
    messages: LLMMessage[],
    options: LLMOptions = {}
  ): Promise<LLMResponse> {
    const model = options.model || this.defaultModel
    const maxTokens = options.maxTokens || 1000
    const temperature = options.temperature ?? 0.7

    if (this.provider === 'openai') {
      return await this.chatOpenAI(messages, model, maxTokens, temperature)
    } else if (this.provider === 'anthropic') {
      return await this.chatAnthropic(messages, model, maxTokens, temperature)
    } else {
      return await this.chatGemini(messages, model, maxTokens, temperature)
    }
  }

  /**
   * OpenAI Chat Completion
   */
  private async chatOpenAI(
    messages: LLMMessage[],
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<LLMResponse> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`OpenAI API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return {
      content: data.choices[0].message.content,
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
      model: data.model,
    }
  }

  /**
   * Anthropic Messages API
   */
  private async chatAnthropic(
    messages: LLMMessage[],
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<LLMResponse> {
    // Anthropic expects system message separately
    const systemMessage = messages.find((m) => m.role === 'system')
    const conversationMessages = messages.filter((m) => m.role !== 'system')

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMessage?.content || undefined,
        messages: conversationMessages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Anthropic API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    return {
      content: data.content[0].text,
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens,
      },
      model: data.model,
    }
  }

  /**
   * Google Gemini API
   */
  private async chatGemini(
    messages: LLMMessage[],
    model: string,
    maxTokens: number,
    temperature: number
  ): Promise<LLMResponse> {
    // Gemini uses a different format - system message is separate
    const systemMessage = messages.find((m) => m.role === 'system')
    const conversationMessages = messages.filter((m) => m.role !== 'system')

    // Convert to Gemini format
    const contents = conversationMessages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const requestBody: any = {
      contents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
      }
    }

    // Add system instruction if present
    if (systemMessage) {
      requestBody.systemInstruction = {
        parts: [{ text: systemMessage.content }]
      }
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Gemini API error: ${response.status} - ${error}`)
    }

    const data = await response.json()

    // Extract text from Gemini response
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''

    // Gemini provides token counts in usageMetadata
    const usage = data.usageMetadata || {}

    return {
      content,
      usage: {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0,
      },
      model: data.modelVersion || model,
    }
  }

  /**
   * Estimate tokens (rough approximation)
   * For production, use tiktoken for OpenAI or Anthropic's tokenizer
   */
  estimateTokens(text: string): number {
    // Rough estimate: ~4 characters per token
    return Math.ceil(text.length / 4)
  }

  /**
   * Calculate cost (rough estimates, update with current pricing)
   */
  estimateCost(usage: { promptTokens: number; completionTokens: number }): number {
    if (this.provider === 'gemini') {
      // Gemini 1.5 Flash pricing (as of Dec 2024) - CHEAPEST!
      // Input: $0.075 / 1M tokens, Output: $0.30 / 1M tokens
      // Gemini 1.5 Pro: Input $1.25, Output $5.00
      const isFlash = this.defaultModel.includes('flash')
      const inputRate = isFlash ? 0.075 : 1.25
      const outputRate = isFlash ? 0.30 : 5.00
      const inputCost = (usage.promptTokens / 1000000) * inputRate
      const outputCost = (usage.completionTokens / 1000000) * outputRate
      return inputCost + outputCost
    } else if (this.provider === 'openai') {
      // GPT-4o-mini pricing (as of Dec 2024)
      // Input: $0.150 / 1M tokens, Output: $0.600 / 1M tokens
      const inputCost = (usage.promptTokens / 1000000) * 0.150
      const outputCost = (usage.completionTokens / 1000000) * 0.600
      return inputCost + outputCost
    } else {
      // Claude 3.5 Sonnet pricing (as of Dec 2024)
      // Input: $3.00 / 1M tokens, Output: $15.00 / 1M tokens
      const inputCost = (usage.promptTokens / 1000000) * 3.00
      const outputCost = (usage.completionTokens / 1000000) * 15.00
      return inputCost + outputCost
    }
  }

  getProvider(): LLMProvider {
    return this.provider
  }

  getModel(): string {
    return this.defaultModel
  }
}

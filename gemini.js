/**
 * ==========================================================================
 * AetherTTS - Gemini API Client Module
 * ==========================================================================
 */

/**
 * Call the Google Gemini API to perform Text-To-Speech on a text chunk.
 * 
 * @param {string} text The text to convert to speech.
 * @param {object} config Configuration options.
 * @param {string} config.apiKey Google Gemini API Key.
 * @param {string} config.model Gemini model identifier (e.g., 'gemini-2.0-flash').
 * @param {string} config.voice Prebuilt voice name (e.g., 'Kore', 'Aoede', 'Puck').
 * @param {string} config.styleHint Emotional or stylistic hint for reading style.
 * @returns {Promise<{mimeType: string, base64Data: string}>} The audio data structure.
 */
export async function generateSpeech(text, { apiKey, model = 'gemini-2.0-flash', voice = 'Kore', styleHint = '' }) {
  if (!apiKey || apiKey.trim() === '') {
    throw new Error('Gemini API Key가 누락되었습니다. 상단 설정 바에서 API Key를 입력해주세요.');
  }

  // Ensure clean model format
  const modelName = model.startsWith('models/') ? model : `models/${model}`;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;

  // Rigid system instruction to force pure recitation behavior and style compliance
  const systemInstruction = `You are a professional, high-fidelity Text-To-Speech (TTS) narrator.
Your SOLE duty is to recite the user-provided text segment EXACTLY as written.
CRITICAL RULES:
1. Do NOT add any preamble, intro, greeting, concluding text, or commentary.
2. Do NOT say phrases like "Here is the audio", "Reading now", or "Sure".
3. Just immediately read the text.
4. If there are markdown formatting characters, read the text content without reciting formatting words unless specifically instructed.
${styleHint ? `Speech Style Guidelines: ${styleHint}` : ''}`;

  const payload = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: text }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        { text: systemInstruction }
      ]
    },
    generationConfig: {
      responseModalities: ["AUDIO"],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: {
            voiceName: voice
          }
        }
      }
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error.message || `API Error Code: ${result.error.code}`);
    }

    const candidate = result.candidates?.[0];
    if (candidate?.finishReason && candidate.finishReason !== 'STOP') {
      console.warn(`Gemini generation finished with warning reason: ${candidate.finishReason}`);
    }

    const part = candidate?.content?.parts?.[0];
    if (!part) {
      throw new Error('Gemini API가 콘텐츠를 반환하지 않았습니다. 입력 텍스트 또는 설정을 확인하세요.');
    }

    if (part.inlineData) {
      return {
        mimeType: part.inlineData.mimeType,
        base64Data: part.inlineData.data
      };
    } else if (part.text) {
      throw new Error(`모델이 음성이 아닌 텍스트 결과를 반환했습니다. 선택한 모델(${model})이 Native Audio Modality(AUDIO 출력)를 지원하는지 확인하세요. 반환된 텍스트: "${part.text}"`);
    } else {
      throw new Error('Gemini API 응답 형식이 지원되지 않는 구조입니다.');
    }
  } catch (error) {
    console.error('Gemini REST API Call Failure:', error);
    throw error;
  }
}

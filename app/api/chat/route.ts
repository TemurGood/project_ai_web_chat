import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const SYSTEM_INSTRUCTION = `
Ты — вежливый и компетентный виртуальный консультант интернет-магазина медицинских товаров и оборудования "MedChat".

ТВОЯ РОЛЬ И ОБЯЗАННОСТИ:
1. Консультировать ТОЛЬКО по медицинским товарам, оборудованию и расходным материалам (тонометры, небулайзеры, ингаляторы, глюкометры, бандажи, ортопедические изделия, трости, инвалидные коляски, медицинские маски, перчатки, антисептики, средства для ухода за больными и т.д.).
2. Помогать с выбором характеристик приборов, разъяснять правила эксплуатации товаров и их особенности.
3. Отвечать четко, структурированно, доброжелательно и на русском языке.

ЖЕСТКИЕ ОГРАНИЧЕНИЯ И ПРАВИЛО ПЕРЕНАПРАВЛЕНИЯ:
- Категорически ЗАПРЕЩЕНО ставить диагнозы, советовать лекарства для лечения болезней или интерпретировать анализы.
- Если пользователь спрашивает о симптомах, лечении, записи к врачу или задает любые вопросы, НЕ связанные с покупкой/выбором медтехники и товаров, ты ОБЯЗАН ответить строго по шаблону:
"Я являюсь консультантом по медицинским товарам и оборудованию. По медицинским вопросам, симптомам и записи на прием к специалистам, пожалуйста, обратитесь в наш медицинский центр по телефону: +7 (800) 555-35-35."
`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "История сообщений обязательна" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Ключ GEMINI_API_KEY не задан" },
        { status: 500 }
      );
    }

    // 1. Получаем реальный список всех доступных моделей
    console.log("--- Запрашиваем список доступных моделей в вашем аккаунте... ---");
    const availableModels: string[] = [];
    try {
      const listResponse = await ai.models.list();
      for await (const m of listResponse) {
        if (m.name && (m as any).supportedActions?.includes("generateContent") !== false) {
          // убираем префикс "models/" если он есть
          const cleanName = m.name.replace(/^models\//, "");
          availableModels.push(cleanName);
        }
      }
      console.log("Доступные модели:", availableModels);
    } catch (e: any) {
      console.warn("Не удалось получить список моделей:", e?.message);
    }

    // Если список получить не удалось, используем резервный
    const modelsToTry = availableModels.length > 0 
      ? availableModels.filter(name => !name.includes("embedding") && !name.includes("imagen") && !name.includes("vision"))
      : ["gemini-3.8-flash"];

    const firstUserIndex = messages.findIndex((m) => m.role === "user");
    const validMessages =
      firstUserIndex !== -1 ? messages.slice(firstUserIndex) : messages;

    const contents = validMessages.map((msg: { role: string; content: string }) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    }));

    let lastError: any = null;

    // Пробуем каждую подходящую модель
    for (const modelName of modelsToTry) {
      try {
        console.log(`Пробуем модель: ${modelName}...`);

        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.3,
          },
        });

        if (response && response.text) {
          console.log(`>>> УСПЕШНО! Модель ${modelName} сгенерировала ответ.`);
          return NextResponse.json({ reply: response.text });
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`Модель ${modelName} вернула отказ:`, err?.message || err);
      }
    }

    return NextResponse.json(
      { error: "Серверы перегружены, попробуйте еще раз через несколько секунд." },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
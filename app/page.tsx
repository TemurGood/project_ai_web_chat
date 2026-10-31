import ChatWidget from "@/components/ChatWidget";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Навигационная панель */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              MedMarket
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 font-semibold px-2 py-0.5 rounded-full">
              Товары для здоровья
            </span>
          </div>
          <div className="text-sm font-medium text-slate-600">
            Регистратура медцентра: <strong className="text-slate-900">+7 (800) 555-35-35</strong>
          </div>
        </div>
      </header>

      {/* Главный промо-баннер */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900">
          Медицинская техника и товары <br className="hidden sm:block" />
          для дома и клиник
        </h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Официальный магазин сертифицированного медицинского оборудования.
          Воспользуйтесь онлайн-консультантом в углу экрана для подбора приборов.
        </p>
      </section>

      {/* Карточки популярных товаров для теста */}
      <section className="max-w-6xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">Медтехника</div>
          <h3 className="text-lg font-bold text-slate-900">Автоматический тонометр Pro-35</h3>
          <p className="text-sm text-slate-500 mt-2">
            Индикатор аритмии, память на 30 измерений, конусная манжета.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">Респираторная терапия</div>
          <h3 className="text-lg font-bold text-slate-900">Компрессорный ингалятор Neb-2</h3>
          <p className="text-sm text-slate-500 mt-2">
            Для взрослых и детей, средний размер частиц 3.16 мкм, маски в комплекте.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="text-blue-600 text-xs font-semibold uppercase tracking-wider mb-2">Ортопедия</div>
          <h3 className="text-lg font-bold text-slate-900">Бандаж коленного сустава</h3>
          <p className="text-sm text-slate-500 mt-2">
            Анатомическая 3D-вязка с силиконовым пателлярным кольцом.
          </p>
        </div>
      </section>

      {/* Сам виджет чата в углу экрана */}
      <ChatWidget />
    </main>
  );
}
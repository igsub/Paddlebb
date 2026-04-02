import Link from "next/link";
import { MapPin, Zap, Users, Bell, Star, ChevronRight, CheckCircle } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* ── NAV ── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
          <span className="font-bold text-lg text-emerald-700 tracking-tight">
            🎾 Paddlebb
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500">
        {/* decorative circles */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/5 rounded-full" />
        <div className="absolute -bottom-32 -left-16 w-72 h-72 bg-white/5 rounded-full" />

        <div className="relative max-w-5xl mx-auto px-5 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" />
            Disponibilidad en tiempo real
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight tracking-tight mb-5">
            Reservá tu cancha<br />
            <span className="text-emerald-200">en segundos</span>
          </h1>

          <p className="text-emerald-100 text-lg sm:text-xl max-w-xl mx-auto mb-8 leading-relaxed">
            Encontrá canchas de paddle cerca tuyo, chequeá disponibilidad en el mapa y reservá con un toque. Sin llamadas, sin esperas.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-700 font-bold px-7 py-3.5 rounded-xl text-base hover:bg-emerald-50 transition-colors shadow-lg"
            >
              Registrarse gratis
              <ChevronRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center bg-white/15 hover:bg-white/25 border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
            >
              Ver canchas
            </Link>
          </div>

          <p className="text-emerald-200/70 text-xs mt-5">
            Gratis para jugadores · Sin tarjeta de crédito
          </p>
        </div>

        {/* wave divider */}
        <div className="relative h-10 -mb-1">
          <svg viewBox="0 0 1440 40" preserveAspectRatio="none" className="absolute inset-0 w-full h-full" fill="white">
            <path d="M0,40 C360,0 1080,0 1440,40 L1440,40 L0,40 Z" />
          </svg>
        </div>
      </section>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-5 py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />Sin costo para jugadores</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />Disponibilidad en tiempo real</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />Partidos abiertos</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="h-4 w-4 text-emerald-500" />Canchas en todo el país</span>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Todo lo que necesitás para jugar
            </h2>
            <p className="text-gray-500 text-lg max-w-lg mx-auto">
              De buscar cancha a pisar la cancha, en menos de un minuto.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: MapPin,
                color: "bg-blue-50 text-blue-600",
                title: "Mapa interactivo",
                desc: "Encontrá los complejos más cercanos con un mapa en tiempo real. Filtrá por ciudad o tipo de cancha.",
              },
              {
                icon: Zap,
                color: "bg-emerald-50 text-emerald-600",
                title: "Reserva instantánea",
                desc: "Elegí el horario que querés y confirmá con un toque. La cancha queda reservada al instante.",
              },
              {
                icon: Users,
                color: "bg-purple-50 text-purple-600",
                title: "Partidos abiertos",
                desc: "¿Te falta compañero? Publicá tu turno y encontrá jugadores de tu nivel para completar el partido.",
              },
              {
                icon: Bell,
                color: "bg-orange-50 text-orange-600",
                title: "Notificaciones",
                desc: "Recibí recordatorios antes de tu turno y avisos cuando se libere un horario que esperabas.",
              },
            ].map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="group bg-gray-50 hover:bg-white border border-transparent hover:border-gray-200 rounded-2xl p-6 transition-all hover:shadow-md"
              >
                <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${color} mb-4`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
              Tres pasos, y a jugar
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                emoji: "🗺️",
                title: "Explorá los complejos",
                desc: "Abrí el mapa, aplicá filtros por ciudad o tipo de cancha y encontrá el complejo que más te convenga.",
              },
              {
                step: "02",
                emoji: "📅",
                title: "Elegí día y horario",
                desc: "Desplazate por los próximos 14 días y elegí el turno disponible que mejor se acomode a tu agenda.",
              },
              {
                step: "03",
                emoji: "✅",
                title: "Confirmá y listo",
                desc: "Reservá con un clic. Recibís confirmación instantánea y un recordatorio antes del partido.",
              },
            ].map(({ step, emoji, title, desc }, i) => (
              <div key={step} className="flex gap-5 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-center">
                    {step}
                  </div>
                  {i < 2 && <div className="w-px flex-1 bg-emerald-100 mt-2" />}
                </div>
                <div className="pt-1.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{emoji}</span>
                    <h3 className="font-bold text-gray-900">{title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-xl transition-colors shadow-md"
            >
              Empezar ahora — es gratis
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── OPEN MATCHES FEATURE ── */}
      <section className="bg-white py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="rounded-3xl bg-gradient-to-br from-purple-600 to-purple-800 overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Text */}
              <div className="p-10 text-white">
                <div className="inline-flex items-center gap-2 bg-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                  <Users className="h-3.5 w-3.5" />
                  Nuevo: Partidos abiertos
                </div>
                <h2 className="text-3xl font-bold mb-4 leading-tight">
                  ¿Te falta<br />compañero?
                </h2>
                <p className="text-purple-200 leading-relaxed mb-6">
                  Publicá tu turno como "partido abierto", elegí el nivel de juego y esperá que otros jugadores soliciten sumarse. Vos aprobás quién juega.
                </p>
                <ul className="space-y-2 text-sm text-purple-100">
                  {["Filtrá por nivel: principiante a competitivo", "Aprobás cada solicitud antes de confirmar", "Notificación push cuando alguien quiere unirse"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-300 shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Mock card */}
              <div className="p-10 flex items-center justify-center">
                <div className="w-full max-w-xs bg-white rounded-2xl shadow-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-gray-900 text-sm">Club Paddle Norte</p>
                    <span className="text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">Cancha 2</span>
                  </div>
                  <p className="text-xs text-gray-500">📅 Sábado 12 abr · ⏰ 19:00 — 20:30</p>
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">Intermedio</span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Amistoso</span>
                    <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold">👥 2 lugares</span>
                  </div>
                  <p className="text-xs text-gray-400">Organiza: <span className="text-gray-700 font-medium">Matías R.</span> · Intermedio</p>
                  <button className="w-full bg-purple-600 text-white text-sm font-semibold py-2 rounded-lg">
                    Solicitar unirse
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── RATINGS ── */}
      <section className="bg-gray-50 py-20 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Elegí con confianza
            </h2>
            <p className="text-gray-500 text-lg max-w-md mx-auto">
              Otros jugadores califican cada complejo después de jugar. Leé opiniones reales antes de reservar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { name: "Lucía M.", rating: 5, comment: "Canchas impecables, el piso de cristal es increíble. Reservé en 30 segundos.", complex: "Club Palermo Paddle" },
              { name: "Rodrigo T.", rating: 5, comment: "Me avisaron cuando se liberó el horario que quería. Excelente la app.", complex: "Paddle Zone Norte" },
              { name: "Valeria S.", rating: 4, comment: "Muy fácil encontrar compañeros con los partidos abiertos. Lo recomiendo.", complex: "Centro Paddle BA" },
            ].map(({ name, rating, comment, complex }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-gray-700 italic mb-4">"{comment}"</p>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{name}</p>
                  <p className="text-xs text-gray-400">{complex}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOR OWNERS ── */}
      <section className="bg-white py-20 px-5 border-t border-gray-100">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* left */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-gray-900 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
                🏟️ Para dueños de complejos
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
                Gestioná tu complejo desde un panel profesional
              </h2>
              <p className="text-gray-500 leading-relaxed mb-6">
                Panel exclusivo para complejos con gestión de canchas, turnos, reservas y estadísticas. Acceso separado, diseñado para operadores.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 mb-8">
                {[
                  "Panel de reservas con filtros por día y estado",
                  "Creación masiva de turnos con rango de fechas",
                  "Contacto directo con jugadores vía WhatsApp",
                  "Estadísticas: reservas hoy, semana y rating promedio",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/owner/login"
                className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
              >
                Acceso para complejos
                <ChevronRight className="h-4 w-4" />
              </Link>
              <p className="text-xs text-gray-400 mt-3">
                Los complejos son incorporados manualmente. Contactanos para sumarte.
              </p>
            </div>

            {/* right: mock dashboard */}
            <div className="flex-1 w-full max-w-sm md:max-w-none">
              <div className="bg-gray-900 rounded-2xl p-5 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-white font-bold text-sm">🏟️ Mi Complejo</p>
                  <span className="text-xs text-gray-400">Panel</span>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                    { label: "Hoy", value: "8", sub: "reservas" },
                    { label: "Semana", value: "43", sub: "reservas" },
                    { label: "Canchas", value: "4", sub: "activas" },
                    { label: "Rating", value: "4.8", sub: "⭐ promedio" },
                  ].map(({ label, value, sub }) => (
                    <div key={label} className="bg-gray-800 rounded-xl p-3">
                      <p className="text-white font-bold text-xl">{value}</p>
                      <p className="text-gray-400 text-xs">{label}</p>
                      <p className="text-gray-500 text-xs">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {[
                    { time: "16:00", player: "Martín G.", court: "Cancha 1" },
                    { time: "17:30", player: "Sofía R.", court: "Cancha 3" },
                    { time: "19:00", player: "Lucas P.", court: "Cancha 2" },
                  ].map(({ time, player, court }) => (
                    <div key={time} className="flex items-center justify-between bg-gray-800 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-white text-xs font-medium">{player}</p>
                        <p className="text-gray-400 text-xs">{court}</p>
                      </div>
                      <span className="text-emerald-400 text-xs font-bold">{time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-gradient-to-br from-emerald-700 to-teal-600 py-20 px-5 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="text-5xl mb-5">🎾</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Empezá a jugar hoy
          </h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-md mx-auto">
            Registrate gratis, encontrá una cancha cerca tuyo y hacé tu primera reserva en menos de un minuto.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-white text-emerald-700 font-extrabold px-9 py-4 rounded-xl text-lg hover:bg-emerald-50 transition-colors shadow-xl"
          >
            Registrarse gratis
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 py-10 px-5">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-white">
            🎾 <span>Paddlebb</span>
          </div>
          <div className="flex gap-5">
            <Link href="/explore" className="hover:text-gray-300 transition-colors">Explorar canchas</Link>
            <Link href="/register" className="hover:text-gray-300 transition-colors">Registrarse</Link>
            <Link href="/owner/login" className="hover:text-gray-300 transition-colors">Complejos</Link>
          </div>
          <p>© {new Date().getFullYear()} Paddlebb</p>
        </div>
      </footer>

    </div>
  );
}

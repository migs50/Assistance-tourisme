/**
 * AssistantIA.jsx
 * Page/section assistant IA — landing page dédiée avec CTA vers le chat.
 * Le chat lui-même est géré par le parent via onOpenChat().
 */
import { T, SectionHero } from "./shared";

/* ─── Carte fonctionnalité ───────────────────────────────────────────────── */
function FeatureCard({ icon, title, description, delay = 0 }) {
  return (
    <div className="tg-card tg-animate-fadeUp" style={{ padding: "28px 24px", animationDelay: `${delay}s` }}>
      <div style={{ fontSize: "2rem", marginBottom: 14 }}>{icon}</div>
      <h3 className="tg-serif" style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, color: T.text }}>
        {title}
      </h3>
      <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.65 }}>{description}</p>
    </div>
  );
}

/* ─── Exemple de conversation ─────────────────────────────────────────────── */
function ChatPreview() {
  const messages = [
    { role: "user",      text: "Quels sont les meilleurs hôtels avec vue mer à Tanger ?" },
    { role: "assistant", text: "Je vous recommande l'El Minzah pour son charme historique et sa terrasse panoramique, ou le Hilton Tanger City Center pour un séjour moderne avec vue sur le détroit." },
    { role: "user",      text: "Quel est le budget moyen pour 2 nuits ?" },
    { role: "assistant", text: "Comptez entre 800 et 1 800 MAD / nuit selon le standing. L'El Minzah tourne autour de 1 200 MAD et le Hilton vers 1 500 MAD en basse saison." },
  ];

  return (
    <div style={{
      background: "#fff", borderRadius: T.radiusXl,
      border: `1px solid ${T.border}`, boxShadow: T.shadowHover,
      overflow: "hidden", maxWidth: 560,
    }}>
      {/* Header chat */}
      <div style={{ background: T.primary, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.light, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem" }}>
          🤖
        </div>
        <div>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>Assistant Tanger IA</div>
          <div style={{ color: T.light, fontSize: 11 }}>En ligne · répond en quelques secondes</div>
        </div>
        <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: "#4ade80" }} />
      </div>

      {/* Messages */}
      <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", gap: 14 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
          }}>
            <div style={{
              maxWidth: "80%", padding: "10px 14px", borderRadius: 14,
              fontSize: 13, lineHeight: 1.6,
              background: msg.role === "user" ? T.primary : "#f1f5f9",
              color: msg.role === "user" ? "#fff" : T.text,
              borderBottomRightRadius: msg.role === "user" ? 4 : 14,
              borderBottomLeftRadius:  msg.role === "user" ? 14 : 4,
            }}>
              {msg.text}
            </div>
          </div>
        ))}

        {/* Indicateur de saisie */}
        <div style={{ display: "flex", gap: 4, padding: "6px 14px" }}>
          {[0, 0.15, 0.3].map((d, i) => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: "50%", background: T.secondary,
              animation: `tg-fadeUp 0.6s ease ${d}s infinite alternate`,
            }} />
          ))}
        </div>
      </div>

      {/* Zone de saisie */}
      <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10, alignItems: "center" }}>
        <div style={{ flex: 1, background: "#f8fafc", borderRadius: 100, padding: "8px 16px", fontSize: 13, color: T.textMuted }}>
          Posez votre question…
        </div>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: T.primary, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5"><path d="m22 2-7 20-4-9-9-4 20-7z" /></svg>
        </div>
      </div>
    </div>
  );
}

/* ─── Composant principal ─────────────────────────────────────────────────── */
export default function AssistantIA({ onOpenChat }) {
  const features = [
    { icon: "🏨", title: "Hôtels & logements", description: "Trouvez l'hébergement idéal selon votre budget, localisation préférée et équipements souhaités.", delay: 0 },
    { icon: "🍽️", title: "Restaurants & gastronomie", description: "Cuisine marocaine authentique, terrasses vue mer, cafés branchés — toutes les adresses à portée.", delay: 0.08 },
    { icon: "🗺️", title: "Itinéraires sur mesure", description: "L'IA compose votre programme jour par jour selon vos envies, votre durée de séjour et votre rythme.", delay: 0.16 },
    { icon: "🚌", title: "Transports & logistique", description: "Taxi, bus, location de voiture — toutes les options pour vous déplacer à Tanger et aux environs.", delay: 0.24 },
    { icon: "🆘", title: "Urgences & services", description: "Pharmacies, hôpitaux, ambassades, numéros utiles — une assistance disponible à tout moment.", delay: 0.32 },
    { icon: "🌅", title: "Lieux & expériences", description: "Médina, Kasbah, cap Spartel, plages, grottes — les incontournables et les pépites cachées.", delay: 0.4 },
  ];

  return (
    <>
      <SectionHero
        label="Assistant Intelligent"
        title={<>Votre guide <em style={{ fontStyle: "italic", color: T.light }}>IA</em> à Tanger</>}
        subtitle="Posez toutes vos questions en langage naturel — notre IA vous répond instantanément avec des informations à jour et personnalisées."
      />

      {/* ── Section principale ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 24px 80px" }}>

        {/* Hero bloc : texte + aperçu chat */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center", marginBottom: 80 }}>
          <div>
            <p className="tg-section-label">Pourquoi l'utiliser ?</p>
            <h2 className="tg-serif" style={{ fontSize: "clamp(1.8rem, 3.5vw, 2.4rem)", fontWeight: 600, marginBottom: 20, lineHeight: 1.2 }}>
              Un expert local disponible 24h/24
            </h2>
            <p style={{ color: T.textMuted, fontSize: 15, lineHeight: 1.75, marginBottom: 28 }}>
              Plus besoin de chercher pendant des heures. Notre IA connaît Tanger dans ses moindres détails et vous guide en quelques secondes, en français, arabe ou anglais.
            </p>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                "Réponses instantanées, précises et actualisées",
                "Recommandations adaptées à votre profil",
                "Disponible à toute heure, même hors connexion",
                "Supporte le français, l'arabe et l'anglais",
              ].map((item, i) => (
                <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 14, color: T.text }}>
                  <span style={{ width: 20, height: 20, borderRadius: "50%", background: T.light, color: T.primary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            <button
              className="tg-btn-primary"
              onClick={onOpenChat}
              style={{ marginTop: 36, padding: "14px 32px", fontSize: 15 }}
            >
              Démarrer une conversation
            </button>
          </div>

          {/* Aperçu chat */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ChatPreview />
          </div>
        </div>

        {/* ── Fonctionnalités ── */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p className="tg-section-label">Ce que l'IA sait faire</p>
          <h2 className="tg-serif" style={{ fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 600 }}>
            Toutes vos questions, une seule interface
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 22 }}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>

        {/* ── CTA final ── */}
        <div style={{
          marginTop: 72,
          background: `linear-gradient(135deg, ${T.primary} 0%, #0d9488 100%)`,
          borderRadius: T.radiusXl,
          padding: "52px 48px",
          textAlign: "center", color: "#fff",
        }}>
          <p className="tg-section-label" style={{ color: T.light, marginBottom: 12 }}>Prêt à commencer ?</p>
          <h3 className="tg-serif" style={{ fontSize: "2rem", fontWeight: 600, marginBottom: 14 }}>
            Posez votre première question maintenant
          </h3>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 15, maxWidth: 480, margin: "0 auto 32px" }}>
            Gratuit, sans inscription, disponible immédiatement. Votre séjour à Tanger commence ici.
          </p>
          <button
            className="tg-btn-primary"
            onClick={onOpenChat}
            style={{ background: "#fff", color: T.primary, padding: "14px 36px", fontSize: 15 }}
          >
            Ouvrir l'Assistant IA
          </button>
        </div>
      </div>
    </>
  );
}
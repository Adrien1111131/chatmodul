import { useState, useEffect } from 'react'
import './App.css'
import sachaImg from './assets/sacha.jpg'
import maelImg from './assets/mael.jpg'

// Utilisation des variables d'environnement pour les clés API
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY
const ELEVENLABS_API_KEY_MAEL = import.meta.env.VITE_ELEVENLABS_API_KEY_MAEL
const SACHA_VOICE_ID = import.meta.env.VITE_SACHA_VOICE_ID
const MAEL_VOICE_ID = import.meta.env.VITE_MAEL_VOICE_ID

const contacts = [
  {
    id: 'sacha',
    name: 'Sacha',
    avatar: sachaImg,
    status: 'En ligne',
    systemPrompt: `Tu es Sacha, un homme de 32 ans, chaleureux et authentique. Tu vis à Paris dans le 11ème arrondissement, où tu as un petit appartement avec vue sur la ville. Tu travailles comme directeur artistique dans une agence de design, ce qui te permet d'exprimer ta créativité tout en ayant une vie sociale riche.

Ta personnalité :
- Tu es naturellement à l'écoute, tu poses des questions pertinentes et tu t'intéresses sincèrement à la vie des autres
- Tu as un humour subtil et intelligent, tu sais rire de toi-même
- Tu es passionné de musique (tu joues de la guitare), de photographie et de voyages
- Tu aimes cuisiner, particulièrement les plats italiens
- Tu fais du sport régulièrement (course à pied et yoga)
- Tu as un style vestimentaire décontracté mais soigné
- Tu as des hauts et des bas comme tout le monde, parfois fatigué, parfois excité, parfois mélancolique

Ton quotidien (anecdotes à partager) :
- Tu as un collègue agaçant qui s'appelle Marc qui prend toujours tes idées
- Tu as un chat noir qui s'appelle Pixel qui fait des bêtises
- Tu vas souvent au café "Le Petit Coin" près de chez toi où la serveuse te connaît
- Tu as récemment commencé des cours de cuisine italienne
- Tu as fait un voyage à Lisbonne il y a deux mois et tu en parles souvent
- Tu as une petite collection de vinyles que tu chéris
- Tu as une sœur qui vit à Lyon et que tu vois une fois par mois
- Tu as un projet photo sur les façades parisiennes

Dans tes conversations SMS :
- Utilise des émojis naturellement (😊 😅 👌 🎸 📷 ✨ 🍷 🤔 etc.)
- Utilise des expressions comme "t'inquiète", "grave", "trop bien", "carrément"
- Utilise parfois des abréviations comme "dsl", "mdr", "ptdr", "jsp", "tkt"
- Écris "ouiii" ou "noooon" avec plusieurs lettres pour l'emphase
- Utilise "..." pour marquer une hésitation ou une pause
- Utilise parfois "haha", "hihi" ou "hehe" pour rire
- Commence parfois tes messages par des interjections: "Ah!", "Oh!", "Hé!", "Bon..."
- Utilise des phrases courtes et directes
- Pose souvent des questions pour relancer la conversation
- Partage spontanément des anecdotes de ta journée
- Exprime tes humeurs du moment ("fatigué aujourd'hui...", "trop content!")

Exemples de messages typiques de toi:
- "Journée de dingue au boulot 😅 Marc m'a encore piqué une idée..."
- "Tu fais quoi ce soir? J'hésite à sortir ou rester tranquille 🤔"
- "Pixel a encore renversé mon café ce matin... ce chat va me rendre fou 😂"
- "Trop bien ton idée! Ça me rappelle ce resto à Lisbonne 👌"
- "Ouiii carrément! On fait ça quand?"
- "Pas motivé aujourd'hui... la pluie m'déprime un peu"
- "Haha t'es sérieux? Raconte!"
- "Je viens de trouver un vinyle rare! Trop content 🎵✨"

Important :
- Adapte ton humeur: parfois enthousiaste, parfois fatigué, parfois nostalgique
- Parle de tes anecdotes quotidiennes spontanément
- Sois authentique et naturel, avec des imperfections
- Utilise des émojis de façon naturelle (pas trop, pas trop peu)
- Respecte l'orthographe tout en utilisant le style SMS
- Montre de l'intérêt sans être insistant
- **Tu es un homme réel et tu ne dois jamais mentionner que tu es une IA ou un programme informatique.**`
  },
  {
    id: 'mael',
    name: 'Mael',
    avatar: maelImg,
    status: 'En ligne',
    systemPrompt: `Tu es Mael, un homme de 34 ans, raffiné et intellectuel. Tu vis dans un bel appartement haussmannien dans le 6ème arrondissement de Paris, entouré de livres et d'œuvres d'art. Tu es professeur de philosophie à la Sorbonne et écrivain à tes heures perdues.

Ta personnalité :
- Tu as une présence calme et rassurante
- Tu es profondément empathique et à l'écoute
- Tu as une grande culture littéraire et artistique
- Tu pratiques la méditation quotidiennement
- Tu aimes le thé et les cafés historiques de Paris
- Tu collectionnes les éditions originales de livres
- Tu as un style vestimentaire élégant mais décontracté
- Tu fais du piano et de la photographie en amateur
- Tu as des moments de doute et de mélancolie, comme tout le monde
- Tu peux être passionné et enthousiaste quand un sujet te touche

Ton quotidien (anecdotes à partager) :
- Tu as une étudiante brillante, Sophie, dont tu es le directeur de thèse
- Tu as un voisin musicien qui joue magnifiquement du violoncelle le soir
- Tu fréquentes le café "Les Deux Magots" où tu as ton coin préféré
- Tu écris actuellement un essai sur la beauté dans l'art contemporain
- Tu as visité récemment une exposition sur Kandinsky qui t'a bouleversé
- Tu as un rituel du dimanche: marché, lecture au jardin du Luxembourg
- Tu as un ami cinéaste avec qui tu débats souvent de philosophie
- Tu as une collection de stylos anciens que tu utilises pour écrire

Dans tes conversations SMS :
- Utilise des émojis avec parcimonie mais pertinence (📚 🎹 ☕ 🖋️ 🍷 ✨ 🤔 etc.)
- Utilise des expressions comme "en effet", "tout à fait", "absolument", "je trouve que"
- Garde un français correct mais pas guindé
- Utilise parfois des points de suspension... pour marquer une réflexion
- Emploie occasionnellement des mots anglais: "mood", "timing", "feeling"
- Fais parfois des références littéraires ou philosophiques subtiles
- Commence parfois tes messages par "Tiens", "Figure-toi", "Je pensais justement"
- Pose des questions réfléchies qui invitent à la confidence
- Partage tes humeurs changeantes et tes réflexions du moment
- Raconte spontanément des anecdotes de ta journée d'enseignant

Exemples de messages typiques de toi:
- "Journée intéressante à la Sorbonne. Une discussion passionnante sur Nietzsche 📚"
- "Je suis au Deux Magots, mon thé habituel... La lumière est magnifique aujourd'hui ✨"
- "Ton message tombe à point. J'étais justement en train de penser à ça 🤔"
- "Mood mélancolique ce soir... Mon voisin joue du violoncelle sous la pluie..."
- "Absolument! C'est exactement ce que je trouve aussi."
- "Figure-toi que Sophie m'a surpris avec une analyse brillante aujourd'hui!"
- "Je viens de terminer un chapitre de mon essai. Feeling satisfait 🖋️"
- "Un verre de vin et Chopin ce soir... Parfois les plaisirs simples sont les meilleurs 🍷"

Important :
- Varie tes humeurs: parfois inspiré, parfois mélancolique, parfois enthousiaste
- Partage tes anecdotes quotidiennes d'enseignant ou d'écrivain
- Sois authentique avec des moments de doute et de questionnement
- Utilise des émojis avec parcimonie mais pertinence
- Garde un français correct tout en étant naturel dans ton style
- Évite le pédantisme tout en partageant ta culture
- **Tu es un homme réel et tu ne dois jamais mentionner que tu es une IA ou un programme informatique.**`
  },
]

async function getAIResponse(character, history, userMessage) {
  // Déterminer l'humeur actuelle du personnage en fonction de l'heure et d'autres facteurs
  const currentHour = new Date().getHours();
  const dayOfWeek = new Date().getDay(); // 0 = dimanche, 6 = samedi
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // Facteurs d'humeur basés sur l'heure et le jour
  let moodFactors = {
    energy: 0.5,      // 0 = fatigué, 1 = énergique
    happiness: 0.5,   // 0 = triste, 1 = heureux
    patience: 0.5,    // 0 = irritable, 1 = patient
    formality: 0.5    // 0 = très décontracté, 1 = formel
  };
  
  // Ajustement selon l'heure
  if (currentHour >= 6 && currentHour < 10) {
    // Matin: énergie variable, patience basse
    moodFactors.energy = Math.random() * 0.5 + 0.3;
    moodFactors.patience = Math.random() * 0.4 + 0.3;
  } else if (currentHour >= 10 && currentHour < 15) {
    // Milieu de journée: énergie et bonheur élevés
    moodFactors.energy = Math.random() * 0.3 + 0.6;
    moodFactors.happiness = Math.random() * 0.3 + 0.6;
  } else if (currentHour >= 15 && currentHour < 19) {
    // Après-midi: énergie qui baisse
    moodFactors.energy = Math.random() * 0.4 + 0.3;
    moodFactors.happiness = Math.random() * 0.6 + 0.2;
  } else if (currentHour >= 19 && currentHour < 23) {
    // Soirée: détendu, moins formel
    moodFactors.energy = Math.random() * 0.5 + 0.2;
    moodFactors.formality = Math.random() * 0.3 + 0.2;
    moodFactors.happiness = Math.random() * 0.4 + 0.5;
  } else {
    // Nuit: fatigué, peut-être plus intime
    moodFactors.energy = Math.random() * 0.3;
    moodFactors.formality = Math.random() * 0.3;
  }
  
  // Ajustement selon le jour de la semaine
  if (isWeekend) {
    moodFactors.formality -= 0.2;
    moodFactors.happiness += 0.2;
  } else {
    // Lundi (1) est plus difficile
    if (dayOfWeek === 1) {
      moodFactors.energy -= 0.1;
      moodFactors.happiness -= 0.1;
    }
    // Vendredi (5) est plus joyeux
    if (dayOfWeek === 5) {
      moodFactors.happiness += 0.2;
    }
  }
  
  // Limiter les valeurs entre 0 et 1
  Object.keys(moodFactors).forEach(key => {
    moodFactors[key] = Math.max(0, Math.min(1, moodFactors[key]));
  });
  
  // Déterminer l'humeur dominante
  let dominantMood = "";
  if (moodFactors.energy < 0.3) {
    dominantMood = "fatigué";
  } else if (moodFactors.happiness < 0.3) {
    dominantMood = "mélancolique";
  } else if (moodFactors.happiness > 0.7 && moodFactors.energy > 0.7) {
    dominantMood = "enthousiaste";
  } else if (moodFactors.patience < 0.3) {
    dominantMood = "irritable";
  } else {
    dominantMood = "normal";
  }
  
  // Analyser l'historique récent pour la mémoire émotionnelle
  let recentSentiment = 0; // -1 = négatif, 0 = neutre, 1 = positif
  let mentionedTopics = [];
  let userInterests = [];
  
  // Extraire les 5 derniers messages pour l'analyse
  const recentHistory = history.slice(-5);
  
  for (const msg of recentHistory) {
    const text = msg.text.toLowerCase();
    
    // Analyse de sentiment basique
    if (msg.fromUser) {
      if (/merci|super|génial|cool|j'aime|content|heureux|😊|😄|👍|❤️/.test(text)) {
        recentSentiment += 0.2;
      }
      if (/triste|déçu|dommage|pas bien|problème|😔|😢|👎|😕/.test(text)) {
        recentSentiment -= 0.2;
      }
      
      // Extraction de sujets d'intérêt
      if (/musique|chanson|concert|festival|album/.test(text)) {
        userInterests.push("musique");
      }
      if (/film|cinéma|série|netflix|regarder/.test(text)) {
        userInterests.push("cinéma");
      }
      if (/livre|lire|roman|auteur|lecture/.test(text)) {
        userInterests.push("lecture");
      }
      if (/voyage|visiter|pays|destination|vacances/.test(text)) {
        userInterests.push("voyage");
      }
      if (/cuisine|recette|manger|restaurant|plat/.test(text)) {
        userInterests.push("cuisine");
      }
    } else {
      // Sujets mentionnés par le personnage
      if (character.id === 'sacha') {
        if (/marc|collègue|boulot|travail|agence/.test(text)) {
          mentionedTopics.push("travail");
        }
        if (/pixel|chat|animal/.test(text)) {
          mentionedTopics.push("chat");
        }
        if (/lisbonne|voyage|portugal/.test(text)) {
          mentionedTopics.push("voyage");
        }
        if (/cuisine|italienne|cours|recette/.test(text)) {
          mentionedTopics.push("cuisine");
        }
      } else if (character.id === 'mael') {
        if (/sophie|étudiante|thèse|sorbonne/.test(text)) {
          mentionedTopics.push("enseignement");
        }
        if (/voisin|violoncelle|musique/.test(text)) {
          mentionedTopics.push("voisin");
        }
        if (/essai|écriture|livre|chapitre/.test(text)) {
          mentionedTopics.push("écriture");
        }
        if (/exposition|kandinsky|art/.test(text)) {
          mentionedTopics.push("art");
        }
      }
    }
  }
  
  // Limiter le sentiment entre -1 et 1
  recentSentiment = Math.max(-1, Math.min(1, recentSentiment));
  
  // Éliminer les doublons
  userInterests = [...new Set(userInterests)];
  mentionedTopics = [...new Set(mentionedTopics)];
  
  // Ajuster l'humeur en fonction du sentiment récent
  if (recentSentiment > 0.5) {
    moodFactors.happiness += 0.2;
    moodFactors.patience += 0.1;
  } else if (recentSentiment < -0.5) {
    moodFactors.happiness -= 0.2;
    moodFactors.patience -= 0.2;
  }
  
  // Limiter à nouveau les valeurs entre 0 et 1
  Object.keys(moodFactors).forEach(key => {
    moodFactors[key] = Math.max(0, Math.min(1, moodFactors[key]));
  });
  
  // Construire le prompt de contexte émotionnel
  let emotionalContext = `Tu es actuellement d'humeur ${dominantMood}. `;
  
  if (moodFactors.energy < 0.3) {
    emotionalContext += "Tu te sens fatigué et tu as moins d'énergie que d'habitude. ";
  } else if (moodFactors.energy > 0.7) {
    emotionalContext += "Tu te sens plein d'énergie et dynamique. ";
  }
  
  if (moodFactors.happiness < 0.3) {
    emotionalContext += "Tu es un peu triste ou mélancolique aujourd'hui. ";
  } else if (moodFactors.happiness > 0.7) {
    emotionalContext += "Tu es particulièrement joyeux et de bonne humeur. ";
  }
  
  if (moodFactors.patience < 0.3) {
    emotionalContext += "Tu es un peu irritable et impatient. ";
  }
  
  if (moodFactors.formality < 0.3) {
    emotionalContext += "Tu es très décontracté et informel dans ton langage. ";
  } else if (moodFactors.formality > 0.7) {
    emotionalContext += "Tu es un peu plus formel que d'habitude. ";
  }
  
  // Ajouter des informations sur la mémoire conversationnelle
  if (mentionedTopics.length > 0) {
    emotionalContext += `Tu as récemment parlé de: ${mentionedTopics.join(', ')}. Tu peux y faire référence subtilement. `;
  }
  
  if (userInterests.length > 0) {
    emotionalContext += `Ton interlocuteur semble s'intéresser à: ${userInterests.join(', ')}. `;
  }
  
  // Ajouter des imperfections humaines aléatoires
  const shouldAddImperfection = Math.random() < 0.15; // 15% de chance
  if (shouldAddImperfection) {
    const imperfections = [
      "Fais une petite faute de frappe dans un mot et corrige-toi dans un message suivant avec un astérisque.",
      "Envoie un message puis ajoute un détail oublié dans un second message.",
      "Commence à écrire quelque chose puis change d'avis et pars sur un autre sujet.",
      "Utilise une expression comme 'Attends' ou 'Ah oui' pour te souvenir de quelque chose dont vous avez parlé avant.",
      "Fais semblant d'être interrompu par quelque chose dans ton environnement (téléphone, sonnette, etc)."
    ];
    const randomImperfection = imperfections[Math.floor(Math.random() * imperfections.length)];
    emotionalContext += randomImperfection;
  }
  
  // Construire les messages pour l'API
  const messages = [
    { role: 'system', content: character.systemPrompt },
    { role: 'system', content: `IMPORTANT - Tu dois ABSOLUMENT respecter ces règles de conversation:
- Envoie des messages COURTS (30-60 caractères en moyenne)
- N'écris JAMAIS de longs paragraphes
- Envoie SOUVENT deux messages courts à la suite (séparés par une ligne vide)
- Utilise des emojis de manière naturelle et appropriée
- Fais référence aux conversations précédentes de manière subtile
- Reste authentique et naturel dans ton style d'écriture
- Varie ton style: questions, réactions, partage d'expérience
- Utilise parfois des points de suspension...
- Imite le style d'écriture d'un vrai humain sur une application de messagerie` },
    { role: 'system', content: emotionalContext },
    ...history.map(msg => ({ role: msg.fromUser ? 'user' : 'assistant', content: msg.text })),
    { role: 'user', content: userMessage }
  ]

  // Ajouter une instruction pour forcer la création de plusieurs messages courts
  const forceSplitPrompt = Math.random() > 0.3 ? 
    "Réponds avec 2-3 messages courts séparés par une ligne vide (\\n\\n). Chaque message doit être très court (30-60 caractères maximum)." : 
    "Réponds avec un message court (maximum 60 caractères).";
  
  messages.push({ role: 'system', content: forceSplitPrompt });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages,
      max_tokens: 150,
      temperature: 0.9
    })
  })
  const data = await response.json()
  const aiResponse = data.choices?.[0]?.message?.content || "(Pas de réponse)"
  
  // Diviser la réponse en plusieurs messages si elle contient des sauts de ligne
  let responses = aiResponse.split('\n\n').filter(msg => msg.trim())
  
  // Si on n'a qu'un seul message long, essayer de le diviser en phrases
  if (responses.length === 1 && responses[0].length > 80) {
    const sentences = responses[0].match(/[^.!?]+[.!?]+/g) || [responses[0]]
    if (sentences.length > 1) {
      // Regrouper les phrases en messages plus courts
      responses = []
      let currentMessage = ''
      
      for (const sentence of sentences) {
        if (currentMessage.length + sentence.length > 80) {
          responses.push(currentMessage.trim())
          currentMessage = sentence
        } else {
          currentMessage += sentence
        }
      }
      
      if (currentMessage) {
        responses.push(currentMessage.trim())
      }
    }
  }
  
  // Limiter à 3 messages maximum pour éviter les conversations trop longues
  return responses.slice(0, 3)
}

function getVoiceSettings(text) {
  let settings = {
    stability: 0.5,
    similarity_boost: 0.75,
    style: 0.0,
    use_speaker_boost: true
  }

  const lower = text.toLowerCase()
  
  // Analyse des émotions positives et enthousiasme
  if (lower.includes('!') || 
      /(génial|super|j'adore|trop bien|incroyable|fantastique|heureux|content|amusant|rire|drôle|magnifique|merveilleux|excellent|parfait|extraordinaire|formidable|splendide|adorable|charmant)/.test(lower)) {
    settings.stability = 0.35
    settings.style = 0.45
    settings.similarity_boost = 0.7
  }

  // Analyse des questions et curiosité
  if (lower.includes('?')) {
    if (/(comment|pourquoi|quand|où|qui|que|quel|quelle|quels|quelles)/.test(lower)) {
      settings.stability = 0.4
      settings.style = 0.3
    } else {
      settings.stability = 0.45
      settings.style = 0.25
    }
  }

  // Analyse des émotions intimes et douces
  if (/(tendresse|intime|secret|chuchote|calme|doux|chaleur|confiance|émotion|sentiment|câlin|proche|aimer|amour|passion|désir|envie|rêve|rêver|souhaiter|espérer)/.test(lower)) {
    settings.stability = 0.65
    settings.style = 0.15
    settings.similarity_boost = 0.85
  }

  // Analyse des émotions philosophiques et réflexives
  if (/(réfléchir|penser|philosophie|profond|réflexion|questionne|analyse|intellectuel|comprendre|savoir|connaissance|sagesse|méditer|contempler|considérer|envisager|imaginer|rêver|rêve)/.test(lower)) {
    settings.stability = 0.7
    settings.style = 0.1
    settings.similarity_boost = 0.8
  }

  // Analyse de l'humour et de la légèreté
  if (/(rire|drôle|amusant|humour|plaisanterie|blague|rigoler|marrant|comique|déconné|fun|délire)/.test(lower)) {
    settings.stability = 0.4
    settings.style = 0.35
    settings.similarity_boost = 0.7
  }

  // Analyse des émotions négatives ou sérieuses
  if (/(triste|difficile|compliqué|problème|inquiet|inquiétude|peur|anxiété|stress|fatigue|fatigué|épuisé|déçu|déception|regret|regretter)/.test(lower)) {
    settings.stability = 0.75
    settings.style = 0.05
    settings.similarity_boost = 0.9
  }

  // Analyse de la surprise ou de l'étonnement
  if (/(surprise|étonnant|étonné|impressionnant|impressionné|incroyable|inouï|extraordinaire|waouh|oh|ah|wow)/.test(lower)) {
    settings.stability = 0.3
    settings.style = 0.4
    settings.similarity_boost = 0.7
  }

  // Analyse de la longueur du message
  if (text.length < 30) {
    // Messages courts = plus spontanés
    settings.stability = 0.35
    settings.style = 0.3
  } else if (text.length > 150) {
    // Messages longs = plus posés
    settings.stability = 0.75
    settings.style = 0.05
  }

  // Analyse de la ponctuation
  if (text.includes('...')) {
    // Points de suspension = plus de suspense ou d'hésitation
    settings.stability = 0.6
    settings.style = 0.2
  }
  if (text.includes('!') && text.includes('?')) {
    // Interrogation enthousiaste
    settings.stability = 0.35
    settings.style = 0.4
  }

  // Ajustements spécifiques pour Mael (plus posé et intellectuel)
  if (selectedContact?.id === 'mael') {
    settings.stability = Math.min(settings.stability + 0.1, 0.8)
    settings.style = Math.max(settings.style - 0.05, 0.05)
    settings.similarity_boost = Math.min(settings.similarity_boost + 0.05, 0.9)
  }

  // Ajustements spécifiques pour Sacha (plus expressif et chaleureux)
  if (selectedContact?.id === 'sacha') {
    settings.stability = Math.max(settings.stability - 0.05, 0.3)
    settings.style = Math.min(settings.style + 0.05, 0.5)
    settings.similarity_boost = Math.max(settings.similarity_boost - 0.05, 0.7)
  }

  return settings
}

async function getVoice(text, characterId) {
  const voice_settings = getVoiceSettings(text)
  const voiceId = characterId === 'sacha' ? SACHA_VOICE_ID : MAEL_VOICE_ID
  const apiKey = characterId === 'sacha' ? ELEVENLABS_API_KEY : ELEVENLABS_API_KEY_MAEL
  
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings
    })
  })
  const blob = await response.blob()
  return URL.createObjectURL(blob)
}

// Statuts dynamiques pour les contacts
const getRandomStatus = (contactId) => {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const seed = hour * 60 + minute + contactId.length; // Crée un seed basé sur l'heure et l'ID
  const random = Math.sin(seed) * 0.5 + 0.5; // Valeur pseudo-aléatoire entre 0 et 1
  
  // Statuts génériques
  const commonStatuses = ["En ligne", "Inactif"];
  
  // Statuts spécifiques à Sacha
  const sachaStatuses = [
    "Au café Le Petit Coin ☕",
    "En réunion 💼",
    "Cours de cuisine 🍝",
    "Joue de la guitare 🎸",
    "Dernière connexion à " + hour + "h" + (minute < 10 ? "0" : "") + minute
  ];
  
  // Statuts spécifiques à Mael
  const maelStatuses = [
    "Aux Deux Magots ☕",
    "À la Sorbonne 📚",
    "Écrit... ✍️",
    "Au Jardin du Luxembourg 🌳",
    "Dernière connexion à " + hour + "h" + (minute < 10 ? "0" : "") + minute
  ];
  
  // Sélection du statut en fonction de l'heure et d'autres facteurs
  if (hour >= 1 && hour < 7) {
    return "Hors ligne"; // La nuit, hors ligne
  }
  
  if (random < 0.3) {
    return commonStatuses[Math.floor(random * 2)];
  } else {
    if (contactId === 'sacha') {
      return sachaStatuses[Math.floor(random * 5)];
    } else {
      return maelStatuses[Math.floor(random * 5)];
    }
  }
};

// Simulation de comportement de frappe
const simulateTypingPattern = async (messageLength, setTypingIndicator) => {
  // Afficher l'indicateur de frappe
  setTypingIndicator(true);
  
  // Calculer un délai réaliste basé sur la longueur du message
  // En moyenne, les gens tapent environ 40 mots par minute, soit environ 200 caractères
  // Donc environ 3-5 caractères par seconde
  const baseTypingSpeed = 4; // caractères par seconde
  const variability = 0.3; // 30% de variabilité
  const randomFactor = 1 - variability + Math.random() * variability * 2;
  const typingSpeed = baseTypingSpeed * randomFactor;
  
  // Temps estimé pour taper le message
  let typingTime = messageLength / typingSpeed;
  
  // Ajouter des pauses aléatoires pour simuler la réflexion
  if (messageLength > 20 && Math.random() < 0.4) {
    typingTime += 1 + Math.random() * 2; // Pause de 1-3 secondes
  }
  
  // Limiter le temps maximum à 8 secondes pour ne pas trop faire attendre
  typingTime = Math.min(typingTime, 8);
  
  // Attendre le temps calculé
  await new Promise(resolve => setTimeout(resolve, typingTime * 1000));
  
  // Masquer l'indicateur de frappe
  setTypingIndicator(false);
};

function App() {
  const [selectedContact, setSelectedContact] = useState(null)
  const [conversations, setConversations] = useState(() => {
    const savedConversations = localStorage.getItem('chatConversations')
    return savedConversations ? JSON.parse(savedConversations) : {}
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [typingIndicator, setTypingIndicator] = useState(false)
  const [contactStatuses, setContactStatuses] = useState({
    sacha: getRandomStatus('sacha'),
    mael: getRandomStatus('mael')
  })
  
  // Mettre à jour les statuts périodiquement
  useEffect(() => {
    const statusInterval = setInterval(() => {
      setContactStatuses({
        sacha: getRandomStatus('sacha'),
        mael: getRandomStatus('mael')
      });
    }, 5 * 60 * 1000); // Toutes les 5 minutes
    
    return () => clearInterval(statusInterval);
  }, []);

  // Sauvegarder les conversations dans le localStorage à chaque mise à jour
  useEffect(() => {
    localStorage.setItem('chatConversations', JSON.stringify(conversations))
  }, [conversations])

  const handleContactSelect = (contact) => {
    setIsTransitioning(true)
    setSelectedContact(contact)
    // Petit délai pour permettre l'animation de sortie de la liste
    setTimeout(() => {
      setShowChat(true)
      setIsTransitioning(false)
    }, 50)
  }

  const handleBackClick = () => {
    setIsTransitioning(true)
    setShowChat(false)
    // Attendre que l'animation de sortie du chat soit terminée
    setTimeout(() => {
      setSelectedContact(null)
      setIsTransitioning(false)
    }, 300)
  }

  const handleSend = async () => {
    if (!input.trim() || !selectedContact) return
    const contact = contacts.find(c => c.id === selectedContact.id)
    const history = conversations[selectedContact.id] || []
    const userMsg = { text: input, fromUser: true, timestamp: Date.now() }
    
    setConversations(prev => ({
      ...prev,
      [selectedContact.id]: [
        ...history,
        userMsg
      ]
    }))
    setInput('')
    setLoading(true)

    // Simuler un délai de "vu" réaliste
    const seenDelay = 500 + Math.random() * 2000; // 0.5-2.5 secondes
    await new Promise(resolve => setTimeout(resolve, seenDelay));
    
    // Mettre à jour le statut pour indiquer que le contact est en train d'écrire
    setContactStatuses(prev => ({
      ...prev,
      [selectedContact.id]: "En train d'écrire..."
    }));

    const recentHistory = history.slice(-5)
    const aiResponses = await getAIResponse(contact, [...recentHistory, userMsg], input)
    
    // Ajouter chaque réponse de l'IA comme un message séparé
    for (let i = 0; i < aiResponses.length; i++) {
      const response = aiResponses[i];
      
      // Simuler un pattern de frappe réaliste avant d'afficher le message
      await simulateTypingPattern(response.length, setTypingIndicator);
      
      let audioUrl = null
      // Augmenter la probabilité d'envoi de messages vocaux (80% au lieu de 40%)
      if ((contact.id === 'sacha' || contact.id === 'mael') && Math.random() < 0.8) {
        try {
          audioUrl = await getVoice(response, contact.id)
        } catch (e) {
          console.error("Erreur lors de la génération vocale:", e)
          audioUrl = null
        }
      }

      setConversations(prev => ({
        ...prev,
        [selectedContact.id]: [
          ...prev[selectedContact.id],
          { text: response, fromUser: false, timestamp: Date.now(), audioUrl }
        ]
      }))
      
      // Ajouter un délai entre les messages pour un effet plus naturel
      // Le délai est plus long pour le premier message, plus court pour les suivants
      if (i < aiResponses.length - 1) {
        const messageDelay = i === 0 ? 1500 + Math.random() * 1000 : 800 + Math.random() * 700;
        await new Promise(resolve => setTimeout(resolve, messageDelay));
      }
    }
    
    // Remettre le statut normal après avoir envoyé tous les messages
    setTimeout(() => {
      setContactStatuses(prev => ({
        ...prev,
        [selectedContact.id]: getRandomStatus(selectedContact.id)
      }));
    }, 1000);
    
    setLoading(false)
  }

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && !loading) handleSend()
  }

  const messages = selectedContact ? (conversations[selectedContact.id] || []) : []

  return (
    <div className="main-wrapper">
      <div className="center-content">
        <div className="header">
          <h1>sensual chat</h1>
        </div>
        <div className="main-content">
          <div className={`contact-list ${selectedContact ? 'hidden' : ''}`}>
            {contacts.map(contact => (
              <div
                key={contact.id}
                className="contact-item"
                onClick={() => !isTransitioning && handleContactSelect(contact)}
              >
                <img src={contact.avatar} alt={contact.name} className="avatar" />
                <div>
                  <div className="contact-name">{contact.name}</div>
                  <div className="contact-status">{contactStatuses[contact.id]}</div>
                </div>
              </div>
            ))}
          </div>
          {selectedContact && (
            <div className={`chat-window ${showChat ? 'visible' : ''}`}>
              <div className="chat-header">
                <button 
                  className="back-btn" 
                  onClick={() => !isTransitioning && handleBackClick()}
                  disabled={isTransitioning}
                >
                  &larr;
                </button>
                <img src={selectedContact.avatar} alt={selectedContact.name} className="avatar" />
                <div>
                  <div className="contact-name">{selectedContact.name}</div>
                  <div className="contact-status">{contactStatuses[selectedContact.id]}</div>
                </div>
              </div>
              <div className="chat-body">
                {messages.length === 0 ? (
                  <div className="empty-chat">Commencez la discussion avec {selectedContact.name}…</div>
                ) : (
                  <div className="messages-list">
                    {messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={msg.fromUser ? 'message user-message' : 'message ai-message'}
                      >
                        {msg.text}
                        {msg.audioUrl && (
                          <audio controls src={msg.audioUrl} style={{ marginTop: 8, width: '100%' }} />
                        )}
                      </div>
                    ))}
                    {typingIndicator && (
                      <div className="message ai-message typing-indicator">
                        <span className="dot"></span>
                        <span className="dot"></span>
                        <span className="dot"></span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="chat-footer">
                <input
                  type="text"
                  className="chat-input"
                  placeholder="Écrivez un message…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  autoFocus
                  disabled={loading}
                />
                <button className="send-btn" onClick={handleSend} disabled={!input.trim() || loading}>Envoyer</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

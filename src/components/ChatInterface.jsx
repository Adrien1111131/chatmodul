import { useState, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  IconButton,
  Text,
  useToast,
  Flex,
  Input,
  Spinner,
} from '@chakra-ui/react'
import { FaMicrophone, FaStop, FaPaperPlane, FaVolumeUp } from 'react-icons/fa'
import { useReactMediaRecorder } from 'react-media-recorder'
import ContactList from './ContactList'
import { AI_CHARACTERS, OPENAI_API_KEY, ELEVENLABS_API_KEY, API_ENDPOINTS } from '../config'
import axios from 'axios'

const CONTACTS = Object.entries(AI_CHARACTERS).map(([id, character]) => ({
  id,
  name: character.name,
  status: 'En ligne',
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${character.name}`,
  systemPrompt: character.systemPrompt
}))

const ChatInterface = () => {
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0])
  const [conversations, setConversations] = useState(
    CONTACTS.reduce((acc, contact) => ({
      ...acc,
      [contact.id]: []
    }), {})
  )
  const [isRecording, setIsRecording] = useState(false)
  const [textMessage, setTextMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false)
  const toast = useToast()
  const audioRef = useRef(null)

  const {
    status,
    startRecording,
    stopRecording,
    mediaBlobUrl,
  } = useReactMediaRecorder({
    audio: true,
    onStop: async (blobUrl, blob) => {
      // TODO: Implémenter l'envoi du fichier audio à Whisper
      console.log('Audio enregistré:', blobUrl)
    },
  })

  const handleStartRecording = () => {
    startRecording()
    setIsRecording(true)
  }

  const handleStopRecording = () => {
    stopRecording()
    setIsRecording(false)
  }

  const sendMessageToGPT = async (message) => {
    try {
      const response = await axios.post(
        API_ENDPOINTS.gpt,
        {
          model: "gpt-4",
          messages: [
            { role: "system", content: selectedContact.systemPrompt },
            ...conversations[selectedContact.id].map(msg => ({
              role: msg.isUser ? "user" : "assistant",
              content: msg.text
            })),
            { role: "user", content: message }
          ],
          temperature: 0.7,
          max_tokens: 150
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return response.data.choices[0].message.content
    } catch (error) {
      console.error('Erreur lors de l\'envoi à GPT:', error)
      toast({
        title: "Erreur",
        description: "Impossible d'obtenir une réponse. Veuillez réessayer.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return null
    }
  }

  // Fonction pour analyser le contexte et adapter les paramètres de la voix
  const getVoiceSettings = (text) => {
    // Paramètres de base
    let settings = {
      stability: 0.5,
      similarity_boost: 0.75,
      style: 0.0,
      use_speaker_boost: true
    }

    // Analyse du texte pour adapter les paramètres
    const lowerText = text.toLowerCase()

    // Si le message contient des émotions positives ou de l'enthousiasme
    if (lowerText.includes('!') || 
        /(super|génial|excellent|fantastique|merveilleux|j'adore|j'aime)/.test(lowerText)) {
      settings.stability = 0.4 // Plus d'expressivité
      settings.style = 0.3 // Plus d'émotion
    }

    // Si le message est plus sérieux ou philosophique
    if (/(pensée|réflexion|considérer|réfléchir|important|significatif)/.test(lowerText)) {
      settings.stability = 0.7 // Plus stable
      settings.style = 0.1 // Plus posé
    }

    // Si le message est plus intime ou personnel
    if (/(sentiment|émotion|ressentir|personnel|intime|confiance)/.test(lowerText)) {
      settings.stability = 0.6
      settings.similarity_boost = 0.85 // Plus proche de la voix originale
      settings.style = 0.2
    }

    // Si le message contient de l'humour
    if (/(rire|drôle|amusant|humour|plaisanterie)/.test(lowerText)) {
      settings.stability = 0.45
      settings.style = 0.25
    }

    // Si le message est une question
    if (lowerText.includes('?')) {
      settings.stability = 0.55
      settings.style = 0.15
    }

    // Si le message est court (probablement plus spontané)
    if (text.length < 50) {
      settings.stability = 0.45
      settings.style = 0.2
    }

    // Si le message est long (probablement plus réfléchi)
    if (text.length > 150) {
      settings.stability = 0.65
      settings.style = 0.1
    }

    return settings
  }

  // Fonction pour générer la voix avec ElevenLabs
  const generateVoice = async (text, voiceId) => {
    try {
      setIsGeneratingVoice(true)
      const voiceSettings = getVoiceSettings(text)
      
      const response = await axios.post(
        `${API_ENDPOINTS.elevenlabs}/${voiceId}`,
        {
          text: text,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings
        },
        {
          headers: {
            'Accept': 'audio/mpeg',
            'xi-api-key': ELEVENLABS_API_KEY,
            'Content-Type': 'application/json'
          },
          responseType: 'blob'
        }
      )

      const audioUrl = URL.createObjectURL(response.data)
      return audioUrl
    } catch (error) {
      console.error('Erreur lors de la génération vocale:', error)
      toast({
        title: "Erreur",
        description: "Impossible de générer la voix. Le message sera affiché en texte uniquement.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return null
    } finally {
      setIsGeneratingVoice(false)
    }
  }

  // Fonction pour décider si on génère une réponse vocale (50% de chance)
  const shouldGenerateVoice = () => {
    return Math.random() < 0.5
  }

  const handleSendMessage = async () => {
    if (!textMessage.trim()) return

    const userMessage = {
      id: Date.now(),
      text: textMessage,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setConversations(prev => ({
      ...prev,
      [selectedContact.id]: [...prev[selectedContact.id], userMessage]
    }))

    setTextMessage('')
    setIsLoading(true)

    const response = await sendMessageToGPT(textMessage)
    
    if (response) {
      let audioUrl = null
      
      // Générer la voix uniquement pour Sacha et aléatoirement
      if (selectedContact.id === 'sacha' && shouldGenerateVoice()) {
        audioUrl = await generateVoice(response, AI_CHARACTERS.sacha.voiceId)
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: response,
        isUser: false,
        timestamp: new Date().toISOString(),
        audioUrl: audioUrl
      }

      setConversations(prev => ({
        ...prev,
        [selectedContact.id]: [...prev[selectedContact.id], aiMessage]
      }))
    }

    setIsLoading(false)
  }

  const currentMessages = conversations[selectedContact.id] || []

  return (
    <Flex w="100%" h="80vh" bg="white" borderRadius="lg" boxShadow="md">
      <ContactList
        contacts={CONTACTS}
        selectedContact={selectedContact}
        onSelectContact={setSelectedContact}
      />
      
      <Box flex={1} display="flex" flexDirection="column">
        {/* En-tête de la conversation */}
        <Flex p={4} borderBottom="1px" borderColor="gray.200" align="center">
          <Text fontWeight="bold" fontSize="lg">
            {selectedContact.name}
          </Text>
        </Flex>

        {/* Zone des messages */}
        <Box
          flex={1}
          overflowY="auto"
          p={4}
          bg="gray.50"
        >
          {currentMessages.map((message) => (
            <Flex
              key={message.id}
              justify={message.isUser ? 'flex-end' : 'flex-start'}
              mb={4}
            >
              <Box
                maxW="70%"
                bg={message.isUser ? 'blue.500' : 'gray.200'}
                color={message.isUser ? 'white' : 'black'}
                p={3}
                borderRadius="lg"
              >
                <Text>{message.text}</Text>
                {message.audioUrl && (
                  <Box mt={2}>
                    <audio 
                      ref={audioRef}
                      controls 
                      src={message.audioUrl}
                      style={{ width: '100%' }}
                    />
                  </Box>
                )}
              </Box>
            </Flex>
          ))}
          {isLoading && (
            <Flex justify="flex-start" mb={4}>
              <Box bg="gray.200" p={3} borderRadius="lg">
                <Spinner size="sm" mr={2} />
                <Text as="span">En train d'écrire...</Text>
              </Box>
            </Flex>
          )}
          {isGeneratingVoice && (
            <Flex justify="flex-start" mb={4}>
              <Box bg="gray.200" p={3} borderRadius="lg">
                <Spinner size="sm" mr={2} />
                <Text as="span">Génération de la voix...</Text>
              </Box>
            </Flex>
          )}
        </Box>

        {/* Zone de saisie */}
        <Box p={4} borderTop="1px" borderColor="gray.200">
          <HStack spacing={4}>
            <IconButton
              icon={isRecording ? <FaStop /> : <FaMicrophone />}
              colorScheme={isRecording ? 'red' : 'blue'}
              onClick={isRecording ? handleStopRecording : handleStartRecording}
              aria-label={isRecording ? 'Arrêter l\'enregistrement' : 'Démarrer l\'enregistrement'}
            />
            <Input
              value={textMessage}
              onChange={(e) => setTextMessage(e.target.value)}
              placeholder="Écrivez votre message..."
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage()
                }
              }}
              disabled={isLoading}
            />
            <IconButton
              icon={<FaPaperPlane />}
              colorScheme="blue"
              onClick={handleSendMessage}
              aria-label="Envoyer le message"
              isLoading={isLoading}
              disabled={isLoading}
            />
          </HStack>
        </Box>
      </Box>
    </Flex>
  )
}

export default ChatInterface 
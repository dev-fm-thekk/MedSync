"use client"

import { useState, useRef, useEffect } from "react"
import { apiConfig } from "@/lib/api-config"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, Loader2, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const mockResponses: Record<string, string> = {
  allergies:
    "Based on the patient's allergy panel results from February 2026, Alice Johnson has mild seasonal allergies managed with Cetirizine 10mg daily (as needed). No severe drug allergies have been documented.",
  cholesterol:
    "The latest lab results from February 2026 show a total cholesterol of 185 mg/dL, which is borderline but trending downward. A follow-up is recommended in 6 months to reassess levels.",
  medications:
    "Current medications include: Cetirizine 10mg daily (as needed for seasonal allergies). A course of Amoxicillin 500mg was recently completed. No other active prescriptions on file.",
  imaging:
    "Two imaging studies are on file: a Chest X-Ray from January 2026 showing clear lungs with no abnormalities, and a Brain MRI from November 2025 with normal findings and no lesions detected.",
  default:
    "Based on the patient's medical records, I can see that Alice Johnson is a 34-year-old female in good overall health. Her recent labs are within normal limits, imaging studies show no abnormalities, and she has no significant chronic conditions. Would you like me to elaborate on any specific aspect of her records?",
}

function getResponse(query: string): string {
  const lower = query.toLowerCase()
  if (lower.includes("allerg")) return mockResponses.allergies
  if (lower.includes("cholesterol") || lower.includes("lipid")) return mockResponses.cholesterol
  if (lower.includes("medication") || lower.includes("prescription") || lower.includes("drug"))
    return mockResponses.medications
  if (lower.includes("imaging") || lower.includes("xray") || lower.includes("mri") || lower.includes("x-ray"))
    return mockResponses.imaging
  return mockResponses.default
}

interface RagChatbotProps {
  patientName: string
}

export function RagChatbot({ patientName }: RagChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `Hello, Doctor. I have access to ${patientName}'s permitted medical files. You can ask me about their medical history, lab results, imaging, medications, or any other information in their records.`,
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    const webhookUrl = apiConfig.n8nRagWebhookUrl?.trim()

    if (webhookUrl) {
      try {
        const res = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: userMessage.content }),
        })
        if (!res.ok) {
          const errText = await res.text()
          throw new Error(errText || `RAG request failed: ${res.status}`)
        }
        const data = (await res.json()) as N8nRagResponse
        const answer =
          typeof data?.answer === "string" && data.answer.trim()
            ? data.answer.trim()
            : "No answer returned from RAG."
        setMessages((prev) => [
          ...prev,
          { id: `bot-${Date.now()}`, role: "assistant", content: answer },
        ])
      } catch (err) {
        const message = err instanceof Error ? err.message : "RAG request failed."
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-${Date.now()}`,
            role: "assistant",
            content: `Sorry, the RAG service couldn't answer: ${message}. Here's a fallback based on sample data:\n\n${getResponse(userMessage.content)}`,
          },
        ])
      }
    } else {
      // No webhook configured: use mock responses
      await new Promise((r) => setTimeout(r, 600))
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          role: "assistant",
          content: getResponse(userMessage.content),
        },
      ])
    }

    setIsLoading(false)
  }

  return (
    <div className="flex h-full w-full flex-col bg-card">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <p className="text-sm font-semibold text-card-foreground">RAG Assistant</p>
          <p className="text-xs text-muted-foreground">
            Query {patientName}&apos;s records
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback
                  className={
                    msg.role === "assistant"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-secondary-foreground"
                  }
                >
                  {msg.role === "assistant" ? <Bot className="h-3.5 w-3.5" /> : "Dr"}
                </AvatarFallback>
              </Avatar>
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <Avatar className="h-7 w-7 shrink-0">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <Bot className="h-3.5 w-3.5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Searching patient records...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="flex gap-2"
        >
          <Input
            placeholder="Ask about the patient..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </Button>
        </form>
        <p className="mt-2 text-[10px] text-muted-foreground text-center">
          AI responses are based on permitted patient files only
        </p>
      </div>
    </div>
  )
}

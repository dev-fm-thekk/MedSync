"use client"

import { mockDocuments } from "@/lib/mock-data"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, ImageIcon, FlaskConical, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

const typeIcon = {
  pdf: FileText,
  image: ImageIcon,
  lab: FlaskConical,
}

const typeColor: Record<string, string> = {
  pdf: "bg-primary/10 text-primary",
  image: "bg-accent/10 text-accent",
  lab: "bg-chart-5/10 text-chart-5",
}

export function DocsView() {
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Documents</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {mockDocuments.length} medical files stored securely
          </p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {mockDocuments.map((doc) => {
          const Icon = typeIcon[doc.type]
          return (
            <Card
              key={doc.id}
              className="group cursor-pointer border-border transition-all hover:border-primary/30 hover:shadow-md"
            >
              <CardContent className="flex items-start gap-4 p-4">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${typeColor[doc.type]}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col gap-1 min-w-0">
                  <span className="truncate text-sm font-medium text-card-foreground">
                    {doc.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {doc.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{doc.size}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{doc.date}</span>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  aria-label={`Download ${doc.name}`}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

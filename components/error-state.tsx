'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  retrying?: boolean
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retrying = false,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6">
      <Alert
        variant="destructive"
        className="max-w-md"
      >
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>
      {onRetry && (
        <Button
          onClick={onRetry}
          disabled={retrying}
          className="mt-4"
          variant="outline"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${retrying ? 'animate-spin' : ''}`}
          />
          {retrying ? 'Retrying...' : 'Try Again'}
        </Button>
      )}
    </div>
  )
}

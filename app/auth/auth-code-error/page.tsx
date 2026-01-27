'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AuthCodeErrorPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="flex justify-center mb-4">
                        <AlertCircle className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
                    <CardDescription>
                        There was a problem signing you in. The code might be expired or invalid.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center flex-col gap-4">
                    <Button onClick={() => router.push('/login')} className="w-full">
                        Try Again
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                        Back to Home
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}

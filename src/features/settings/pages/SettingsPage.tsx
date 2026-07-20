import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account preferences."
      />
      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how the app looks on your device.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={theme ?? 'light'}
            onValueChange={setTheme}
            className="grid gap-3"
          >
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <RadioGroupItem value="light" id="theme-light" />
              <Label htmlFor="theme-light" className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                <Sun className="size-4" />
                Light
              </Label>
            </div>
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <RadioGroupItem value="dark" id="theme-dark" />
              <Label htmlFor="theme-dark" className="flex flex-1 cursor-pointer items-center gap-2 font-normal">
                <Moon className="size-4" />
                Dark
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  )
}

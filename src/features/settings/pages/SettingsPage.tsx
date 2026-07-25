import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { PageHeader } from '@/components/layout/PageHeader'
import { useColorTheme, type ColorTheme } from '@/components/theme/color-theme-provider'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const COLOR_THEME_OPTIONS: { value: ColorTheme; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'claude', label: 'Claude' },
  { value: 'tangerine', label: 'Tangerine' },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { colorTheme, setColorTheme } = useColorTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="color-theme">Theme</Label>
            {mounted ? (
              <Select value={colorTheme} onValueChange={(value) => setColorTheme(value as ColorTheme)}>
                <SelectTrigger id="color-theme" className="w-full">
                  <SelectValue placeholder="Select a theme" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_THEME_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="flex h-9 w-full items-center rounded-md border border-input px-3 text-sm text-muted-foreground">
                Loading…
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Mode</Label>
            <RadioGroup
              value={mounted ? (theme ?? 'dark') : 'dark'}
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
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

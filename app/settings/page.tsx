'use client'

import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Container,
  Stack,
  TextField,
  MenuItem,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Paper,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import {
  Person as PersonIcon,
  Security as SecurityIcon,
  Palette as PaletteIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Warning as WarningIcon
} from '@mui/icons-material'
import Sidebar from '@/components/sidebar/SidebarEnhanced'
import { useTheme as useCustomTheme } from '@/lib/context/ThemeContext'
import { useTranslation } from '@/lib/i18n/translations'
import { checkPassportExpiry, checkPassportValidityForTravel } from '@/lib/utils/passport-warnings'
import { getVisaRules, hasVisaRules } from '@/lib/visa-rules/nationality-rules'

interface UserSettings {
  // 프로필 & 여권 정보
  nationality: string
  passportIssuedDate: string
  passportExpiryDate: string
  
  // 인터페이스
  theme: 'light' | 'dark'
  language: 'en' | 'ko'
  weekStartsOn: 0 | 1 // 0 = Sunday, 1 = Monday
  
  // 개인정보
  dataRetentionDays: number
  allowAnalytics: boolean
}

const defaultSettings: UserSettings = {
  nationality: 'US',
  passportIssuedDate: '',
  passportExpiryDate: '',
  theme: 'light',
  language: 'en',
  weekStartsOn: 1,
  dataRetentionDays: 365,
  allowAnalytics: true
}

const countries = [
  { code: 'US', name: 'United States', flag: '🇺🇸' },
  { code: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵' },
  { code: 'CN', name: 'China', flag: '🇨🇳' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪' },
  { code: 'FR', name: 'France', flag: '🇫🇷' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' }
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const { theme, setTheme } = useCustomTheme()
  const { t, language, setLanguage } = useTranslation()
  
  // Passport warnings
  const passportWarning = settings.passportExpiryDate 
    ? checkPassportExpiry(settings.passportExpiryDate)
    : null
    
  // Visa rules availability
  const hasNationalityRules = hasVisaRules(settings.nationality)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('dino-v5-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        const mergedSettings = { ...defaultSettings, ...parsed }
        setSettings(mergedSettings)
        
        // Sync with theme and language contexts
        if (parsed.theme && parsed.theme !== theme) {
          setTheme(parsed.theme)
        }
        if (parsed.language && parsed.language !== language) {
          setLanguage(parsed.language)
        }
      } catch (error) {
        console.error('Failed to parse saved settings:', error)
      }
    }
  }, [])

  const handleSettingChange = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    setSuccessMessage('')
    
    // Apply changes immediately for certain settings
    if (key === 'theme') {
      setTheme(value)
    } else if (key === 'language') {
      setLanguage(value)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Save to localStorage (in real app, this would be an API call)
      localStorage.setItem('dino-v5-settings', JSON.stringify(settings))
      setHasChanges(false)
      setSuccessMessage('Settings saved successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAllData = async () => {
    try {
      // Clear all data (in real app, this would be an API call)
      localStorage.removeItem('dino-v5-settings')
      localStorage.removeItem('dino-v5-stays') // If we store stays in localStorage
      
      setSettings(defaultSettings)
      setHasChanges(false)
      setDeleteDialogOpen(false)
      setSuccessMessage('All data deleted successfully!')
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (error) {
      console.error('Failed to delete data:', error)
      alert('Failed to delete data. Please try again.')
    }
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'white' }}>
      <Sidebar 
        countries={[]}
        selectedCountry=""
        onSelectCountry={() => {}}
        currentPage="settings"
        onAddStay={() => {}}
      />
      
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box 
          sx={{ 
            backgroundColor: 'white',
            borderBottom: '1px solid #e8eaed',
            px: 3,
            py: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography 
              variant="h5" 
              component="h1" 
              sx={{ 
                color: '#202124',
                fontFamily: 'Google Sans, Roboto, sans-serif',
                fontWeight: 400,
                fontSize: '1.375rem'
              }}
            >
              {t('settings.title')}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={!hasChanges || saving}
                size="small"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, p: 3, overflow: 'auto', backgroundColor: 'white' }}>
          <Container maxWidth="md">
            {successMessage && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {successMessage}
              </Alert>
            )}

            <Stack spacing={4}>
              {/* 프로필 & 여권 정보 */}
              <Paper sx={{ p: 3, border: '1px solid #e8eaed', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PersonIcon sx={{ color: '#1a73e8', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#202124', fontWeight: 500 }}>
                    Profile & Passport Information
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <TextField
                    select
                    label={`${t('settings.nationality')} *`}
                    value={settings.nationality}
                    onChange={(e) => handleSettingChange('nationality', e.target.value)}
                    fullWidth
                    helperText={hasNationalityRules 
                      ? `${t('settings.nationality')} affects visa rules`
                      : `No visa rules available for ${countries.find(c => c.code === settings.nationality)?.name}`
                    }
                    color={hasNationalityRules ? 'primary' : 'warning'}
                  >
                    {countries.map(country => (
                      <MenuItem key={country.code} value={country.code}>
                        {country.flag} {country.name}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label={t('settings.passportIssued')}
                      type="date"
                      value={settings.passportIssuedDate}
                      onChange={(e) => handleSettingChange('passportIssuedDate', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      helperText="When your passport was issued"
                    />
                    <TextField
                      label={t('settings.passportExpiry')}
                      type="date"
                      value={settings.passportExpiryDate}
                      onChange={(e) => handleSettingChange('passportExpiryDate', e.target.value)}
                      fullWidth
                      InputLabelProps={{ shrink: true }}
                      helperText={passportWarning ? passportWarning.message : "When your passport expires"}
                      color={passportWarning?.severity === 'error' ? 'error' : passportWarning?.severity === 'warning' ? 'warning' : 'primary'}
                      error={passportWarning?.severity === 'error'}
                    />
                  </Box>
                </Stack>
              </Paper>

              {/* 인터페이스 설정 */}
              <Paper sx={{ p: 3, border: '1px solid #e8eaed', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <PaletteIcon sx={{ color: '#1a73e8', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#202124', fontWeight: 500 }}>
                    Interface Settings
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <TextField
                    select
                    label={t('settings.theme')}
                    value={theme}
                    onChange={(e) => handleSettingChange('theme', e.target.value)}
                    fullWidth
                    helperText="Choose your preferred appearance"
                  >
                    <MenuItem value="light">{t('theme.light')}</MenuItem>
                    <MenuItem value="dark">{t('theme.dark')}</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label={t('settings.language')}
                    value={language}
                    onChange={(e) => handleSettingChange('language', e.target.value)}
                    fullWidth
                    helperText="Interface language"
                  >
                    <MenuItem value="en">{t('lang.english')}</MenuItem>
                    <MenuItem value="ko">{t('lang.korean')}</MenuItem>
                  </TextField>

                  <TextField
                    select
                    label="Week Starts On"
                    value={settings.weekStartsOn}
                    onChange={(e) => handleSettingChange('weekStartsOn', Number(e.target.value))}
                    fullWidth
                    helperText="First day of the week in calendar view"
                  >
                    <MenuItem value={0}>Sunday</MenuItem>
                    <MenuItem value={1}>Monday</MenuItem>
                  </TextField>
                </Stack>
              </Paper>

              {/* 개인정보 보호 */}
              <Paper sx={{ p: 3, border: '1px solid #e8eaed', borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <SecurityIcon sx={{ color: '#1a73e8', mr: 2 }} />
                  <Typography variant="h6" sx={{ color: '#202124', fontWeight: 500 }}>
                    Privacy & Data
                  </Typography>
                </Box>

                <Stack spacing={3}>
                  <TextField
                    select
                    label="Data Retention Period"
                    value={settings.dataRetentionDays}
                    onChange={(e) => handleSettingChange('dataRetentionDays', Number(e.target.value))}
                    fullWidth
                    helperText="How long to keep your travel data"
                  >
                    <MenuItem value={30}>30 days</MenuItem>
                    <MenuItem value={90}>90 days</MenuItem>
                    <MenuItem value={365}>1 year</MenuItem>
                    <MenuItem value={1095}>3 years</MenuItem>
                    <MenuItem value={-1}>Forever</MenuItem>
                  </TextField>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={settings.allowAnalytics}
                        onChange={(e) => handleSettingChange('allowAnalytics', e.target.checked)}
                      />
                    }
                    label="Allow usage analytics"
                  />

                  <Divider sx={{ my: 2 }} />
                  
                  <Box>
                    <Typography variant="subtitle2" color="error" gutterBottom>
                      Danger Zone
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      This action cannot be undone. All your travel records, settings, and data will be permanently deleted.
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Delete All Data
                    </Button>
                  </Box>
                </Stack>
              </Paper>
            </Stack>
          </Container>
        </Box>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete All Data?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you absolutely sure you want to delete all your data? This action cannot be undone.
            All your travel records, settings, and preferences will be permanently removed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteAllData} color="error" variant="contained">
            Delete Everything
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
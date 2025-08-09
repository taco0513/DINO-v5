'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Chip,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  useTheme
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Info as InfoIcon
} from '@mui/icons-material'
import { countries } from '@/lib/data/countries-and-airports'
import { VisaInformation, VisaType, VisaData, CreateVisaRequest, ApplicationStep } from '@/lib/types/visa'
// Removed deprecated style imports

interface VisaFormEditorProps {
  open: boolean
  onClose: () => void
  onSave: (data: CreateVisaRequest) => Promise<void>
  initialData?: VisaInformation | null
  userEmail: string
}

export default function VisaFormEditor({ 
  open, 
  onClose, 
  onSave, 
  initialData, 
  userEmail 
}: VisaFormEditorProps) {
  const theme = useTheme()
  const [formData, setFormData] = useState<CreateVisaRequest>({
    countryCode: '',
    visaType: 'tourist' as VisaType,
    data: {},
    source: 'official',
    updatedBy: userEmail
  })

  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  // Initialize form data when dialog opens
  useEffect(() => {
    if (initialData) {
      setFormData({
        countryCode: initialData.countryCode,
        visaType: initialData.visaType,
        data: initialData.data,
        source: initialData.source,
        updatedBy: userEmail
      })
    } else {
      // Reset form for new entry
      setFormData({
        countryCode: '',
        visaType: 'tourist' as VisaType,
        data: getDefaultVisaData('tourist'),
        source: 'official',
        updatedBy: userEmail
      })
    }
  }, [initialData, userEmail, open])

  // Get default data structure based on visa type
  const getDefaultVisaData = (type: VisaType): VisaData => {
    switch (type) {
      case 'tourist':
        return {
          visaRequired: false,
          duration: 90,
          resetType: 'exit',
          extension: {
            available: false
          },
          requirements: [],
          fees: {
            currency: 'USD',
            amount: 0,
            paymentMethods: []
          },
          processingTime: {
            min: 0,
            max: 0
          }
        }
      case 'digital_nomad':
        return {
          available: false,
          officialName: '',
          duration: 180,
          renewable: false,
          requirements: [] as string[],
          benefits: [],
          restrictions: [],
          fees: {
            currency: 'USD',
            amount: 0,
            paymentMethods: []
          },
          processingTime: {
            min: 0,
            max: 0
          }
        }
      case 'alerts':
        return {
          alerts: []
        }
      default:
        return {}
    }
  }

  // Handle visa type change
  const handleVisaTypeChange = (type: VisaType) => {
    setFormData(prev => ({
      ...prev,
      visaType: type,
      data: getDefaultVisaData(type)
    }))
  }

  // Update nested data fields
  const updateDataField = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev.data }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {}
        }
        current = current[keys[i]]
      }
      
      current[keys[keys.length - 1]] = value
      
      return {
        ...prev,
        data: newData
      }
    })
  }

  // Add item to array field
  const addArrayItem = (path: string, item: any) => {
    setFormData(prev => {
      const newData = { ...prev.data }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      const arrayField = keys[keys.length - 1]
      if (!current[arrayField]) {
        current[arrayField] = []
      }
      current[arrayField].push(item)
      
      return {
        ...prev,
        data: newData
      }
    })
  }

  // Remove item from array field
  const removeArrayItem = (path: string, index: number) => {
    setFormData(prev => {
      const newData = { ...prev.data }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      
      const arrayField = keys[keys.length - 1]
      if (current[arrayField]) {
        current[arrayField].splice(index, 1)
      }
      
      return {
        ...prev,
        data: newData
      }
    })
  }

  // Validate form data
  const validateForm = (): boolean => {
    const newErrors: string[] = []

    if (!formData.countryCode) {
      newErrors.push('Country is required')
    }

    if (!formData.visaType) {
      newErrors.push('Visa type is required')
    }

    // Type-specific validation
    if (formData.visaType === 'tourist' && formData.data.visaRequired === undefined) {
      newErrors.push('Visa requirement status is required')
    }

    if (formData.visaType === 'digital_nomad' && formData.data.available === undefined) {
      newErrors.push('Availability status is required')
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setSaving(true)
    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error('Error saving visa data:', error)
      setErrors(['Failed to save visa information'])
    } finally {
      setSaving(false)
    }
  }

  // Render tourist visa form
  const renderTouristVisaForm = () => (
    <Stack spacing={3}>
      <FormControlLabel
        control={
          <Switch
            checked={!formData.data.visaRequired}
            onChange={(e) => updateDataField('visaRequired', !e.target.checked)}
          />
        }
        label="Visa Free Entry"
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 6 }}>
          <TextField
            fullWidth
            label="Duration (days)"
            type="number"
            value={formData.data.duration || 0}
            onChange={(e) => updateDataField('duration', parseInt(e.target.value))}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <FormControl fullWidth>
            <InputLabel>Reset Type</InputLabel>
            <Select
              value={formData.data.resetType || 'exit'}
              onChange={(e) => updateDataField('resetType', e.target.value)}
              label="Reset Type"
            >
              <MenuItem value="exit">Per Entry</MenuItem>
              <MenuItem value="rolling">Rolling Window</MenuItem>
              <MenuItem value="calendar">Calendar Year</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {formData.data.resetType === 'rolling' && (
        <TextField
          fullWidth
          label="Period Days"
          type="number"
          value={formData.data.periodDays || 180}
          onChange={(e) => updateDataField('periodDays', parseInt(e.target.value))}
          helperText="Number of days for the rolling window period"
        />
      )}

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Extension Options</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={formData.data.extension?.available || false}
                  onChange={(e) => updateDataField('extension.available', e.target.checked)}
                />
              }
              label="Extension Available"
            />
            {formData.data.extension?.available && (
              <>
                <TextField
                  fullWidth
                  label="Extension Duration (days)"
                  type="number"
                  value={formData.data.extension?.duration || 0}
                  onChange={(e) => updateDataField('extension.duration', parseInt(e.target.value))}
                />
                <TextField
                  fullWidth
                  label="Extension Cost"
                  type="number"
                  value={formData.data.extension?.cost || 0}
                  onChange={(e) => updateDataField('extension.cost', parseInt(e.target.value))}
                />
              </>
            )}
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Requirements</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            {Array.isArray(formData.data.requirements) && formData.data.requirements?.map((req, index) => (
              <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  value={req}
                  onChange={(e) => {
                    const newReqs = [...(Array.isArray(formData.data.requirements) ? formData.data.requirements : [])]
                    newReqs[index] = e.target.value
                    updateDataField('requirements', newReqs)
                  }}
                />
                <IconButton onClick={() => removeArrayItem('requirements', index)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => addArrayItem('requirements', '')}
              sx={{ textTransform: 'none', fontWeight: 500 }}
            >
              Add Requirement
            </Button>
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Fees & Processing</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack spacing={2}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Fee Amount"
                  type="number"
                  value={formData.data.fees?.amount || 0}
                  onChange={(e) => updateDataField('fees.amount', parseInt(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Currency"
                  value={formData.data.fees?.currency || 'USD'}
                  onChange={(e) => updateDataField('fees.currency', e.target.value)}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Min Processing Days"
                  type="number"
                  value={formData.data.processingTime?.min || 0}
                  onChange={(e) => updateDataField('processingTime.min', parseInt(e.target.value))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Max Processing Days"
                  type="number"
                  value={formData.data.processingTime?.max || 0}
                  onChange={(e) => updateDataField('processingTime.max', parseInt(e.target.value))}
                />
              </Grid>
            </Grid>
          </Stack>
        </AccordionDetails>
      </Accordion>
    </Stack>
  )

  // Render digital nomad visa form
  const renderDigitalNomadForm = () => (
    <Stack spacing={3}>
      <FormControlLabel
        control={
          <Switch
            checked={formData.data.available || false}
            onChange={(e) => updateDataField('available', e.target.checked)}
          />
        }
        label="Digital Nomad Visa Available"
      />

      {formData.data.available && (
        <>
          <TextField
            fullWidth
            label="Official Visa Name"
            value={formData.data.officialName || ''}
            onChange={(e) => updateDataField('officialName', e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <TextField
                fullWidth
                label="Duration (days)"
                type="number"
                value={formData.data.duration || 0}
                onChange={(e) => updateDataField('duration', parseInt(e.target.value))}
              />
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.data.renewable || false}
                    onChange={(e) => updateDataField('renewable', e.target.checked)}
                  />
                }
                label="Renewable"
              />
            </Grid>
          </Grid>

          {/* Income Requirements section removed - requirements is now a string array */}

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Benefits</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {formData.data.benefits?.map((benefit, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      value={benefit}
                      onChange={(e) => {
                        const newBenefits = [...(formData.data.benefits || [])]
                        newBenefits[index] = e.target.value
                        updateDataField('benefits', newBenefits)
                      }}
                    />
                    <IconButton onClick={() => removeArrayItem('benefits', index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addArrayItem('benefits', '')}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Add Benefit
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>

          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>Restrictions</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {formData.data.restrictions?.map((restriction, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      value={restriction}
                      onChange={(e) => {
                        const newRestrictions = [...(formData.data.restrictions || [])]
                        newRestrictions[index] = e.target.value
                        updateDataField('restrictions', newRestrictions)
                      }}
                    />
                    <IconButton onClick={() => removeArrayItem('restrictions', index)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ))}
                <Button
                  startIcon={<AddIcon />}
                  onClick={() => addArrayItem('restrictions', '')}
                  sx={{ textTransform: 'none', fontWeight: 500 }}
                >
                  Add Restriction
                </Button>
              </Stack>
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </Stack>
  )

  // Render alerts form
  const renderAlertsForm = () => (
    <Stack spacing={3}>
      <Typography variant="body2" color="textSecondary">
        Add important alerts and updates for this country
      </Typography>
      
      {formData.data.alerts?.map((alert, index) => (
        <Box key={index} sx={{ p: theme.spacing(2), border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>Alert Type</InputLabel>
              <Select
                value={alert.type}
                onChange={(e) => {
                  const newAlerts = [...(formData.data.alerts || [])]
                  newAlerts[index] = { ...alert, type: e.target.value as any }
                  updateDataField('alerts', newAlerts)
                }}
                label="Alert Type"
              >
                <MenuItem value="warning">Warning</MenuItem>
                <MenuItem value="info">Info</MenuItem>
                <MenuItem value="update">Update</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Message"
              value={alert.message}
              onChange={(e) => {
                const newAlerts = [...(formData.data.alerts || [])]
                newAlerts[index] = { ...alert, message: e.target.value }
                updateDataField('alerts', newAlerts)
              }}
            />
            <Button
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => removeArrayItem('alerts', index)}
            >
              Remove Alert
            </Button>
          </Stack>
        </Box>
      ))}
      
      <Button
        startIcon={<AddIcon />}
        onClick={() => addArrayItem('alerts', { type: 'info', message: '' })}
        sx={{ textTransform: 'none', fontWeight: 500 }}
      >
        Add Alert
      </Button>
    </Stack>
  )

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {initialData ? 'Edit Visa Information' : 'Add Visa Information'}
      </DialogTitle>
      <DialogContent>
        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Stack spacing={3} sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Country</InputLabel>
                <Select
                  value={formData.countryCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, countryCode: e.target.value }))}
                  label="Country"
                  disabled={!!initialData}
                >
                  {countries.map(country => (
                    <MenuItem key={country.code} value={country.code}>
                      {country.flag} {country.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Visa Type</InputLabel>
                <Select
                  value={formData.visaType}
                  onChange={(e) => handleVisaTypeChange(e.target.value as VisaType)}
                  label="Visa Type"
                  disabled={!!initialData}
                >
                  <MenuItem value="tourist">Tourist</MenuItem>
                  <MenuItem value="digital_nomad">Digital Nomad</MenuItem>
                  <MenuItem value="business">Business</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                  <MenuItem value="working_holiday">Working Holiday</MenuItem>
                  <MenuItem value="transit">Transit</MenuItem>
                  <MenuItem value="alerts">Alerts</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <FormControl fullWidth>
            <InputLabel>Source</InputLabel>
            <Select
              value={formData.source}
              onChange={(e) => setFormData(prev => ({ ...prev, source: e.target.value as any }))}
              label="Source"
            >
              <MenuItem value="official">Official</MenuItem>
              <MenuItem value="community">Community</MenuItem>
              <MenuItem value="ai_generated">AI Generated</MenuItem>
            </Select>
          </FormControl>

          <Box sx={{ mt: 3 }}>
            {formData.visaType === 'tourist' && renderTouristVisaForm()}
            {formData.visaType === 'digital_nomad' && renderDigitalNomadForm()}
            {formData.visaType === 'alerts' && renderAlertsForm()}
            {!['tourist', 'digital_nomad', 'alerts'].includes(formData.visaType) && (
              <Alert severity="info">
                Form editor for {formData.visaType} visa type is under development.
              </Alert>
            )}
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          variant="contained" 
          sx={{ textTransform: 'none', fontWeight: 500 }}
          disabled={saving}
        >
          {saving ? 'Saving...' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
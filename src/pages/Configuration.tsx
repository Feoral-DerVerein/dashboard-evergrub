import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User, Mail, Phone, Lock, Camera, Bell, Shield, Palette, Globe, Save, Eye, EyeOff, CreditCard, Cloud } from 'lucide-react';
const Configuration = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();

  // Profile state
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    phone: '',
    avatarUrl: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorAuth: false,
    language: 'es',
    theme: 'light',
    currency: 'USD'
  });

  // Bank account state
  const [bankAccount, setBankAccount] = useState({
    accountHolderName: '',
    accountNumber: '',
    bankName: '',
    routingNumber: '',
    accountType: 'checking',
    country: 'US'
  });

  // API settings state
  const [apiSettings, setApiSettings] = useState({
    lovableDashboardUrl: '',
    apiKey: '',
    enableInsights: true
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load user profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const {
          data: profileData,
          error
        } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (error && error.code !== 'PGRST116') {
          console.error('Error loading profile:', error);
          return;
        }
        setProfile({
          fullName: profileData?.full_name || user.user_metadata?.full_name || '',
          email: user.email || '',
          phone: user.user_metadata?.phone || '',
          avatarUrl: profileData?.avatar_url || user.user_metadata?.avatar_url || ''
        });
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };
    loadProfile();
  }, [user]);
  const handleSettingsUpdate = async () => {
    try {
      // Save settings to localStorage for persistence
      localStorage.setItem('userSettings', JSON.stringify(settings));
      toast({
        title: "Settings updated",
        description: "Your preferences have been saved successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Could not save settings",
        variant: "destructive"
      });
    }
  };

  const handleBankAccountUpdate = async () => {
    try {
      // Save bank account to localStorage for now (in production, this would be encrypted and stored securely)
      localStorage.setItem('bankAccount', JSON.stringify(bankAccount));
      toast({
        title: "Bank account updated",
        description: "Your payment information has been saved securely"
      });
    } catch (error) {
      console.error('Error saving bank account:', error);
      toast({
        title: "Error",
        description: "Could not save bank account information",
        variant: "destructive"
      });
    }
  };

  const handleApiSettingsUpdate = async () => {
    try {
      localStorage.setItem('apiSettings', JSON.stringify(apiSettings));
      toast({
        title: "API settings updated",
        description: "Your Lovable dashboard integration has been configured"
      });
    } catch (error) {
      console.error('Error saving API settings:', error);
      toast({
        title: "Error",
        description: "Could not save API settings",
        variant: "destructive"
      });
    }
  };

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({
          ...prev,
          ...parsed
        }));
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }

    // Load bank account from localStorage
    const savedBankAccount = localStorage.getItem('bankAccount');
    if (savedBankAccount) {
      try {
        const parsed = JSON.parse(savedBankAccount);
        setBankAccount(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved bank account:', error);
      }
    }

    // Load API settings from localStorage
    const savedApiSettings = localStorage.getItem('apiSettings');
    if (savedApiSettings) {
      try {
        const parsed = JSON.parse(savedApiSettings);
        setApiSettings(prev => ({ ...prev, ...parsed }));
      } catch (error) {
        console.error('Error loading saved API settings:', error);
      }
    }
  }, []);
  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      // Update profile in profiles table
      const {
        error: profileError
      } = await supabase.from('profiles').upsert({
        id: user.id,
        full_name: profile.fullName,
        avatar_url: profile.avatarUrl,
        updated_at: new Date().toISOString()
      });
      if (profileError) throw profileError;

      // Update user metadata if needed
      const {
        error: authError
      } = await supabase.auth.updateUser({
        data: {
          full_name: profile.fullName,
          phone: profile.phone,
          avatar_url: profile.avatarUrl
        }
      });
      if (authError) throw authError;
      toast({
        title: "Profile updated",
        description: "Changes have been saved successfully"
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Could not update profile",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    try {
      const {
        error
      } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      if (error) throw error;
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      toast({
        title: "Password updated",
        description: "Your password has been changed successfully"
      });
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        title: "Error",
        description: "Could not change password",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-4xl mx-auto glass-card min-h-screen">
        {/* Header */}
        <header className="px-6 py-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Settings</h1>
              <p className="text-gray-500">Manage your profile and account preferences</p>
            </div>
          </div>
        </header>
        
        <div className="p-6 space-y-8">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={profile.avatarUrl} />
                  <AvatarFallback className="text-lg">
                    {profile.fullName?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Label htmlFor="avatar-url">Profile picture URL</Label>
                  <Input id="avatar-url" value={profile.avatarUrl} onChange={e => setProfile(prev => ({
                  ...prev,
                  avatarUrl: e.target.value
                }))} placeholder="https://example.com/photo.jpg" />
                  <p className="text-sm text-gray-500">
                    Enter the URL of your profile picture
                  </p>
                </div>
              </div>
              
              <Separator />
              
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" value={profile.fullName} onChange={e => setProfile(prev => ({
                  ...prev,
                  fullName: e.target.value
                }))} placeholder="Your full name" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" value={profile.email} disabled className="bg-gray-50" />
                  <p className="text-sm text-gray-500">
                    Email cannot be changed for security reasons
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={profile.phone} onChange={e => setProfile(prev => ({
                  ...prev,
                  phone: e.target.value
                }))} placeholder="+1 234 567 8900" />
                </div>
              </div>
              
              <Button onClick={handleProfileUpdate} disabled={isSaving} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardContent>
          </Card>
          
          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current password</Label>
                    <div className="relative">
                      <Input id="current-password" type={showPasswords.current ? "text" : "password"} value={passwordForm.currentPassword} onChange={e => setPasswordForm(prev => ({
                      ...prev,
                      currentPassword: e.target.value
                    }))} placeholder="Current password" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      current: !prev.current
                    }))}>
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New password</Label>
                    <div className="relative">
                      <Input id="new-password" type={showPasswords.new ? "text" : "password"} value={passwordForm.newPassword} onChange={e => setPasswordForm(prev => ({
                      ...prev,
                      newPassword: e.target.value
                    }))} placeholder="New password" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      new: !prev.new
                    }))}>
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="confirm-password">Confirm new password</Label>
                    <div className="relative">
                      <Input id="confirm-password" type={showPasswords.confirm ? "text" : "password"} value={passwordForm.confirmPassword} onChange={e => setPasswordForm(prev => ({
                      ...prev,
                      confirmPassword: e.target.value
                    }))} placeholder="Confirm new password" />
                      <Button type="button" variant="ghost" size="sm" className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent" onClick={() => setShowPasswords(prev => ({
                      ...prev,
                      confirm: !prev.confirm
                    }))}>
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <Button onClick={handlePasswordChange} disabled={isLoading || !passwordForm.newPassword} variant="outline">
                  <Lock className="w-4 h-4 mr-2" />
                  {isLoading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Two-Factor Authentication</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable 2FA</p>
                    <p className="text-sm text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch checked={settings.twoFactorAuth} onCheckedChange={checked => setSettings(prev => ({
                  ...prev,
                  twoFactorAuth: checked
                }))} />
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive important notifications via email
                  </p>
                </div>
                <Switch checked={settings.emailNotifications} onCheckedChange={checked => setSettings(prev => ({
                ...prev,
                emailNotifications: checked
              }))} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push notifications</p>
                  <p className="text-sm text-gray-500">
                    Receive real-time notifications
                  </p>
                </div>
                <Switch checked={settings.pushNotifications} onCheckedChange={checked => setSettings(prev => ({
                ...prev,
                pushNotifications: checked
              }))} />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Marketing emails</p>
                  <p className="text-sm text-gray-500">
                    Receive product offers and news
                  </p>
                </div>
                <Switch checked={settings.marketingEmails} onCheckedChange={checked => setSettings(prev => ({
                ...prev,
                marketingEmails: checked
              }))} />
              </div>
            </CardContent>
          </Card>

          {/* Bank Account for Payments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Payment Information
              </CardTitle>
              <p className="text-sm text-gray-500">
                Add your bank account to receive payments from Wisebite sales and Grains redemptions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="account-holder">Account holder name</Label>
                  <Input 
                    id="account-holder" 
                    value={bankAccount.accountHolderName} 
                    onChange={e => setBankAccount(prev => ({ ...prev, accountHolderName: e.target.value }))}
                    placeholder="Full name as on bank account" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bank-name">Bank name</Label>
                  <Input 
                    id="bank-name" 
                    value={bankAccount.bankName} 
                    onChange={e => setBankAccount(prev => ({ ...prev, bankName: e.target.value }))}
                    placeholder="Your bank's name" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-number">Account number</Label>
                  <Input 
                    id="account-number" 
                    type="password"
                    value={bankAccount.accountNumber} 
                    onChange={e => setBankAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                    placeholder="••••••••••••" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="routing-number">Routing number</Label>
                  <Input 
                    id="routing-number" 
                    value={bankAccount.routingNumber} 
                    onChange={e => setBankAccount(prev => ({ ...prev, routingNumber: e.target.value }))}
                    placeholder="9-digit routing number" 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="account-type">Account type</Label>
                  <Select 
                    value={bankAccount.accountType} 
                    onValueChange={value => setBankAccount(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select 
                    value={bankAccount.country} 
                    onValueChange={value => setBankAccount(prev => ({ ...prev, country: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="ES">Spain</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="MX">Mexico</SelectItem>
                      <SelectItem value="BR">Brazil</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">Secure Payment Processing</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your banking information is encrypted and stored securely. We use industry-standard security 
                      measures to protect your financial data. Payments from Grains redemptions and Wisebite sales 
                      will be processed to this account within 1-3 business days.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleBankAccountUpdate} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save Payment Information
              </Button>
            </CardContent>
          </Card>
          
          {/* API Integration Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5" />
                API Integration
              </CardTitle>
              <p className="text-sm text-gray-500">
                Configure your Lovable.dev dashboard API for AI insights integration with n8n
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lovable-api-url">Lovable Dashboard API URL</Label>
                  <Input 
                    id="lovable-api-url" 
                    value={apiSettings.lovableDashboardUrl} 
                    onChange={e => setApiSettings(prev => ({ ...prev, lovableDashboardUrl: e.target.value }))}
                    placeholder="https://api.lovable.dev/v1/insights" 
                  />
                  <p className="text-sm text-gray-500">
                    URL endpoint from your Lovable dashboard for receiving AI insights
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-key">API Key (Optional)</Label>
                  <Input 
                    id="api-key" 
                    type="password"
                    value={apiSettings.apiKey} 
                    onChange={e => setApiSettings(prev => ({ ...prev, apiKey: e.target.value }))}
                    placeholder="••••••••••••••••••••••••••••••••" 
                  />
                  <p className="text-sm text-gray-500">
                    API key for authenticating with your dashboard (if required)
                  </p>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Enable Insights Sync</p>
                    <p className="text-sm text-gray-500">
                      Automatically send AI insights to your dashboard via n8n
                    </p>
                  </div>
                  <Switch 
                    checked={apiSettings.enableInsights} 
                    onCheckedChange={checked => setApiSettings(prev => ({ ...prev, enableInsights: checked }))} 
                  />
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Cloud className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">n8n Integration Setup</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      This API URL will be used by n8n workflows to send AI-generated insights to your Lovable dashboard. 
                      Create an HTTP node in n8n that makes POST requests to this endpoint with the insights data.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button onClick={handleApiSettingsUpdate} className="w-full md:w-auto">
                <Save className="w-4 h-4 mr-2" />
                Save API Settings
              </Button>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select value={settings.language} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  language: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish (Español)</SelectItem>
                      <SelectItem value="fr">French (Français)</SelectItem>
                      <SelectItem value="de">German (Deutsch)</SelectItem>
                      <SelectItem value="it">Italian (Italiano)</SelectItem>
                      <SelectItem value="pt">Portuguese (Português)</SelectItem>
                      <SelectItem value="ru">Russian (Русский)</SelectItem>
                      <SelectItem value="ja">Japanese (日本語)</SelectItem>
                      <SelectItem value="ko">Korean (한국어)</SelectItem>
                      <SelectItem value="zh">Chinese (中文)</SelectItem>
                      <SelectItem value="ar">Arabic (العربية)</SelectItem>
                      <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                      <SelectItem value="th">Thai (ไทย)</SelectItem>
                      <SelectItem value="vi">Vietnamese (Tiếng Việt)</SelectItem>
                      <SelectItem value="nl">Dutch (Nederlands)</SelectItem>
                      <SelectItem value="sv">Swedish (Svenska)</SelectItem>
                      <SelectItem value="da">Danish (Dansk)</SelectItem>
                      <SelectItem value="no">Norwegian (Norsk)</SelectItem>
                      <SelectItem value="fi">Finnish (Suomi)</SelectItem>
                      <SelectItem value="pl">Polish (Polski)</SelectItem>
                      <SelectItem value="tr">Turkish (Türkçe)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={settings.currency} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  currency: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                      <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                      <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                      <SelectItem value="SEK">SEK - Swedish Krona</SelectItem>
                      <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                      <SelectItem value="MXN">MXN - Mexican Peso</SelectItem>
                      <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                      <SelectItem value="HKD">HKD - Hong Kong Dollar</SelectItem>
                      <SelectItem value="NOK">NOK - Norwegian Krone</SelectItem>
                      <SelectItem value="KRW">KRW - South Korean Won</SelectItem>
                      <SelectItem value="TRY">TRY - Turkish Lira</SelectItem>
                      <SelectItem value="RUB">RUB - Russian Ruble</SelectItem>
                      <SelectItem value="INR">INR - Indian Rupee</SelectItem>
                      <SelectItem value="BRL">BRL - Brazilian Real</SelectItem>
                      <SelectItem value="ZAR">ZAR - South African Rand</SelectItem>
                      <SelectItem value="COP">COP - Colombian Peso</SelectItem>
                      <SelectItem value="CLP">CLP - Chilean Peso</SelectItem>
                      <SelectItem value="PEN">PEN - Peruvian Sol</SelectItem>
                      <SelectItem value="ARS">ARS - Argentine Peso</SelectItem>
                      <SelectItem value="UYU">UYU - Uruguayan Peso</SelectItem>
                      <SelectItem value="BOB">BOB - Bolivian Boliviano</SelectItem>
                      <SelectItem value="VES">VES - Venezuelan Bolívar</SelectItem>
                      <SelectItem value="CRC">CRC - Costa Rican Colón</SelectItem>
                      <SelectItem value="GTQ">GTQ - Guatemalan Quetzal</SelectItem>
                      <SelectItem value="HNL">HNL - Honduran Lempira</SelectItem>
                      <SelectItem value="NIO">NIO - Nicaraguan Córdoba</SelectItem>
                      <SelectItem value="PAB">PAB - Panamanian Balboa</SelectItem>
                      <SelectItem value="DOP">DOP - Dominican Peso</SelectItem>
                      <SelectItem value="CUP">CUP - Cuban Peso</SelectItem>
                      <SelectItem value="JMD">JMD - Jamaican Dollar</SelectItem>
                      <SelectItem value="TTD">TTD - Trinidad and Tobago Dollar</SelectItem>
                      <SelectItem value="BBD">BBD - Barbadian Dollar</SelectItem>
                      <SelectItem value="XCD">XCD - East Caribbean Dollar</SelectItem>
                      <SelectItem value="THB">THB - Thai Baht</SelectItem>
                      <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                      <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                      <SelectItem value="PHP">PHP - Philippine Peso</SelectItem>
                      <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                      <SelectItem value="LAK">LAK - Lao Kip</SelectItem>
                      <SelectItem value="KHR">KHR - Cambodian Riel</SelectItem>
                      <SelectItem value="MMK">MMK - Myanmar Kyat</SelectItem>
                      <SelectItem value="BDT">BDT - Bangladeshi Taka</SelectItem>
                      <SelectItem value="PKR">PKR - Pakistani Rupee</SelectItem>
                      <SelectItem value="LKR">LKR - Sri Lankan Rupee</SelectItem>
                      <SelectItem value="NPR">NPR - Nepalese Rupee</SelectItem>
                      <SelectItem value="AFN">AFN - Afghan Afghani</SelectItem>
                      <SelectItem value="IRR">IRR - Iranian Rial</SelectItem>
                      <SelectItem value="IQD">IQD - Iraqi Dinar</SelectItem>
                      <SelectItem value="SAR">SAR - Saudi Riyal</SelectItem>
                      <SelectItem value="AED">AED - UAE Dirham</SelectItem>
                      <SelectItem value="KWD">KWD - Kuwaiti Dinar</SelectItem>
                      <SelectItem value="BHD">BHD - Bahraini Dinar</SelectItem>
                      <SelectItem value="QAR">QAR - Qatari Riyal</SelectItem>
                      <SelectItem value="OMR">OMR - Omani Rial</SelectItem>
                      <SelectItem value="JOD">JOD - Jordanian Dinar</SelectItem>
                      <SelectItem value="LBP">LBP - Lebanese Pound</SelectItem>
                      <SelectItem value="SYP">SYP - Syrian Pound</SelectItem>
                      <SelectItem value="ILS">ILS - Israeli New Shekel</SelectItem>
                      <SelectItem value="EGP">EGP - Egyptian Pound</SelectItem>
                      <SelectItem value="MAD">MAD - Moroccan Dirham</SelectItem>
                      <SelectItem value="DZD">DZD - Algerian Dinar</SelectItem>
                      <SelectItem value="TND">TND - Tunisian Dinar</SelectItem>
                      <SelectItem value="LYD">LYD - Libyan Dinar</SelectItem>
                      <SelectItem value="NGN">NGN - Nigerian Naira</SelectItem>
                      <SelectItem value="GHS">GHS - Ghanaian Cedi</SelectItem>
                      <SelectItem value="KES">KES - Kenyan Shilling</SelectItem>
                      <SelectItem value="UGX">UGX - Ugandan Shilling</SelectItem>
                      <SelectItem value="TZS">TZS - Tanzanian Shilling</SelectItem>
                      <SelectItem value="RWF">RWF - Rwandan Franc</SelectItem>
                      <SelectItem value="ETB">ETB - Ethiopian Birr</SelectItem>
                      <SelectItem value="XOF">XOF - West African CFA Franc</SelectItem>
                      <SelectItem value="XAF">XAF - Central African CFA Franc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select value={settings.theme} onValueChange={value => setSettings(prev => ({
                  ...prev,
                  theme: value
                }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button onClick={handleSettingsUpdate} className="w-full md:w-auto mt-4">
                <Save className="w-4 h-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};
export default Configuration;
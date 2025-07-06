import { useState, useRef } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Camera, Upload, User, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { indianStates, getCitiesByState } from "@/lib/cities";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    phone: "",
    state: "",
    city: "",
    role: "customer" as "customer" | "vendor",
    profileImage: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [uploadMethod, setUploadMethod] = useState<"file" | "camera" | "url">("file");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  
  const { signup } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Reset city when state changes
      ...(field === "state" ? { city: "" } : {})
    }));
  };

  // Photo upload helpers
  const handlePhotoChange = (file: File) => {
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please select a photo smaller than 5MB",
          variant: "destructive",
        });
        return;
      }
      handlePhotoChange(file);
    }
  };

  const handleUrlSubmit = () => {
    if (formData.profileImage) {
      setPhotoPreview(formData.profileImage);
      setProfilePhoto(null);
      toast({
        title: "Photo URL set",
        description: "Profile photo has been updated",
      });
    }
  };

  const clearPhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview("");
    setFormData(prev => ({ ...prev, profileImage: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.username || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const { confirmPassword, ...signupData } = formData;
      
      // Add profile photo data if available
      const finalSignupData = {
        ...signupData,
        profileImage: photoPreview || formData.profileImage || undefined,
      };
      
      await signup(finalSignupData);
      
      toast({
        title: "Account created successfully!",
        description: formData.role === "customer" 
          ? "Welcome to Instoredealz! Start exploring deals now."
          : "Your vendor account has been created. Please complete your business registration.",
      });
      
      // Redirect based on role
      if (formData.role === "vendor") {
        navigate("/vendor/register");
      } else {
        navigate("/customer/dashboard");
      }
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const availableCities = formData.state ? getCitiesByState(formData.state) : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-royal/5 flex items-center justify-center p-4">
      <div className="w-full max-w-[90vw] sm:max-w-md mx-auto">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <Link to="/">
            <h1 className="text-2xl sm:text-3xl font-bold text-primary">Instoredealz</h1>
          </Link>
          <p className="text-sm sm:text-base text-muted-foreground mt-2 px-4">Join India's fastest-growing deals platform</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Account</CardTitle>
            <CardDescription>
              Start saving money with exclusive deals
            </CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Account Type</Label>
                <Select value={formData.role} onValueChange={(value) => handleInputChange("role", value)}>
                  <SelectTrigger className="w-full py-3 px-3 text-sm sm:text-base">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer - Find and claim deals</SelectItem>
                    <SelectItem value="vendor">Vendor - Offer deals to customers</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Basic Info */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">Username *</Label>
                <Input
                  id="username"
                  placeholder="Choose a username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={isLoading}
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Profile Photo Upload */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Photo (Optional)</Label>
                
                {/* Upload Method Selection */}
                <div className="flex space-x-2 mb-3">
                  <Button
                    type="button"
                    variant={uploadMethod === "file" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMethod("file")}
                    className="text-xs"
                  >
                    <Upload className="h-3 w-3 mr-1" />
                    Upload
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMethod === "camera" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMethod("camera")}
                    className="text-xs"
                  >
                    <Camera className="h-3 w-3 mr-1" />
                    Camera
                  </Button>
                  <Button
                    type="button"
                    variant={uploadMethod === "url" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUploadMethod("url")}
                    className="text-xs"
                  >
                    URL
                  </Button>
                </div>

                {/* Photo Preview */}
                {photoPreview && (
                  <div className="relative inline-block">
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200">
                      <img
                        src={photoPreview}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={clearPhoto}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* Upload Controls */}
                {uploadMethod === "file" && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full text-sm"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Photo File
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG or GIF (max 5MB)
                    </p>
                  </div>
                )}

                {uploadMethod === "camera" && (
                  <div>
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full text-sm"
                      disabled={isLoading}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Take Photo
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      Use your device camera to take a photo
                    </p>
                  </div>
                )}

                {uploadMethod === "url" && (
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <Input
                        type="url"
                        placeholder="Enter image URL"
                        value={formData.profileImage}
                        onChange={(e) => handleInputChange("profileImage", e.target.value)}
                        className="flex-1 text-sm"
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUrlSubmit}
                        size="sm"
                        disabled={!formData.profileImage || isLoading}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Enter a direct link to your profile photo
                    </p>
                  </div>
                )}
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">State</Label>
                  <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
                    <SelectTrigger className="w-full py-3 px-3 text-sm sm:text-base">
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {indianStates.map((state) => (
                        <SelectItem key={state.name} value={state.name}>
                          {state.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">City</Label>
                  <Select 
                    value={formData.city} 
                    onValueChange={(value) => handleInputChange("city", value)}
                    disabled={!formData.state}
                  >
                    <SelectTrigger className="w-full py-3 px-3 text-sm sm:text-base">
                      <SelectValue placeholder="Select city" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableCities.map((city) => (
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">Password *</Label>
                <PasswordInput
                  id="password"
                  placeholder="Create a password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  disabled={isLoading}
                  required
                  showStrengthIndicator={true}
                  showRequirements={true}
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password *</Label>
                <PasswordInput
                  id="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                  disabled={isLoading}
                  required
                  className="w-full py-3 px-3 text-sm sm:text-base border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Promotional Banner */}
              <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                <p className="text-sm font-medium text-success">🎉 Limited Time Offer!</p>
                <p className="text-xs text-success/80">
                  Get 1 year free Premium membership (valid until Aug 14, 2026)
                </p>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full py-3 text-sm sm:text-base font-medium" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Account
              </Button>

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </p>
                <Link to="/" className="text-sm text-gray-500 hover:underline">
                  Back to Home
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}

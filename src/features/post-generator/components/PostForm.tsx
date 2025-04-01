"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Characters } from "../data/characters"
import DownloadButton from "@/components/generator/DownloadButton"
import { useDebounce } from "@/hooks/useDebounce"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface PostFormProps {
  onFormChange: (
    postType: string,
    postCode: string,
    selectedGames: string[],
    selectedCharacters: { [key: string]: string },
    netPrice: string,
    isStarterAccount: boolean,
    postDescription: string
  ) => void;
  imageUrl: string | null; // Add this prop to receive imageUrl from parent
}

const PostForm: React.FC<PostFormProps> = ({ onFormChange, imageUrl }) => {
  const [selectedPostType, setSelectedPostType] = useState<string>("New")

  // For code input
  const [codeInput, setCodeInput] = useState("")
  const code = useDebounce(codeInput, 500)

  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [selectedCharacters, setSelectedCharacters] = useState<{ [key: string]: string }>({})

  // For net price input
  const [netPriceInput, setNetPriceInput] = useState("")
  const netPrice = useDebounce(netPriceInput, 500)

  const [isStarterAccount, setIsStarterAccount] = useState(false)

  // For description input - separate immediate UI value from debounced render value
  const [descriptionInput, setDescriptionInput] = useState("")
  const description = useDebounce(descriptionInput, 1000)

  // Track what's actually being rendered to avoid unnecessary re-renders
  const [renderingDescription, setRenderingDescription] = useState("")

  const handleCodeChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "") // Remove non-numeric characters
    setCodeInput(cleanedValue)
  }

  const handleGameChange = (game: string) => {
    const isCurrentlySelected = selectedGames.includes(game)
    let newSelectedGames: string[]

    if (isCurrentlySelected) {
      newSelectedGames = selectedGames.filter((g) => g !== game)
      // Remove character selection for the deselected game
      setSelectedCharacters((prev) => {
        const newChars = { ...prev }
        delete newChars[game]
        return newChars
      })
    } else {
      // Limit selection if needed (e.g., max 3 games)
      if (selectedGames.length < 3) {
        newSelectedGames = [...selectedGames, game]
      } else {
        // Optionally provide feedback that max games reached
        console.warn("Maximum number of games selected")
        return // Prevent adding more than 3
      }
    }
    setSelectedGames(newSelectedGames)
  }

  const handleCharacterChange = (game: string, character: string) => {
    setSelectedCharacters((prev) => ({
      ...prev,
      [game]: character,
    }))
  }

  const handleNetPriceChange = (value: string) => {
    const cleanedValue = value.replace(/\D/g, "") // Remove non-numeric characters
    setNetPriceInput(cleanedValue)
  }

  const handleDescriptionChange = (value: string) => {
    // Update the display value immediately for responsive typing
    setDescriptionInput(value)
  }

  useEffect(() => {
    // Only trigger re-rendering if the debounced description has actually changed
    if (description !== renderingDescription) {
      setRenderingDescription(description)
    }
  }, [description, renderingDescription]) 

  // Modify the useEffect in PostForm.tsx
  useEffect(() => {
    // Only call onFormChange when dependencies actually change, not on every render
    if (onFormChange) {
      // Use a ref to track if it's the first render
      const formData = {
        postType: selectedPostType,
        postCode: "AAA" + code,
        selectedGames,
        selectedCharacters,
        netPrice,
        isStarterAccount,
        postDescription: description.toUpperCase()
      };
      
      // Use this instead of directly calling onFormChange every time
      onFormChange(
        formData.postType,
        formData.postCode,
        formData.selectedGames,
        formData.selectedCharacters,
        formData.netPrice,
        formData.isStarterAccount,
        formData.postDescription
      );
    }
  }, [
    selectedPostType, 
    code, 
    selectedGames, 
    selectedCharacters, 
    netPrice, 
    isStarterAccount, 
    description,
  ]);

  // Calculate line and character limits for the textarea
  const MAX_CHARS_PER_LINE = 45
  const MAX_LINES = 4
  const MAX_TOTAL_CHARS = 180

  // Count lines that exceed the character limit
  const lines = descriptionInput.split('\n')
  const lineWarnings = lines.map(line => line.length > MAX_CHARS_PER_LINE)
  const hasLineWarning = lineWarnings.some(warning => warning)
  const lineCount = lines.length
  const lineCountWarning = lineCount > MAX_LINES

  return (
    <div className="w-1/4 h-screen">
      {/* Form Section */}
      <div className="bg-white p-6 border-r rounded-r-3xl shadow-lg h-screen overflow-y-auto">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <h2 className="text-base font-semibold text-gray-800 mb-3">Configure Post</h2>
  
          {/* Post Type Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs">Post Type:</Label>
            <RadioGroup value={selectedPostType} onValueChange={setSelectedPostType} className="flex space-x-4">
              {["New", "Drop", "Repost"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={type} 
                    id={`type-${type}`} 
                    className="h-3.5 w-3.5 border-ai-cyan text-ai-cyan focus:ring-ai-cyan" 
                  />
                  <Label htmlFor={`type-${type}`} className="text-xs font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
  
          {/* Code Input */}
          <div className="space-y-1.5">
            <Label className="text-xs">Code:</Label>
            <div className="flex h-8 w-1/3 items-center rounded-md border border-input bg-background px-3 py-1 text-sm focus-within:border-ai-cyan focus-within:ring-1 focus-within:ring-ai-cyan transition duration-150">
              <span className="text-xs text-muted-foreground mr-2">AAA</span>
              <Input
                type="text"
                value={codeInput}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 border-0 h-6 p-0 text-xs shadow-none focus-visible:ring-0"
                maxLength={4}
              />
            </div>
          </div>
  
          {/* Game Selection */}
          <div className="space-y-1.5">
            <Label className="text-xs">Select Games:</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(Characters).map((game) => (
                <div key={game} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`game-${game}`}
                    checked={selectedGames.includes(game)}
                    onCheckedChange={() => handleGameChange(game)}
                    disabled={!selectedGames.includes(game) && selectedGames.length >= 3}
                    className="h-3.5 w-3.5 border-ai-cyan text-ai-cyan focus:ring-ai-cyan data-[state=checked]:bg-ai-cyan data-[state=checked]:border-ai-cyan"
                  />
                  <Label htmlFor={`game-${game}`} className="text-xs font-normal">
                    {game.toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
  
          {/* Character Selection */}
          {selectedGames.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">Character Selection:</Label>
              {selectedGames.map((game) => (
                <div key={game} className="flex items-center space-x-2">
                  <span className="text-xs font-medium bg-ai-cyan text-white px-2 py-0.5 rounded w-20 text-center">
                    {game.toUpperCase()}
                  </span>
                  <Select
                    value={selectedCharacters[game] || ""}
                    onValueChange={(value) => handleCharacterChange(game, value)}
                  >
                    <SelectTrigger className="flex-1 h-7 text-xs border-input focus:border-ai-cyan focus:ring-1 focus:ring-ai-cyan">
                      <SelectValue placeholder="Select a Character" />
                    </SelectTrigger>
                    <SelectContent className="text-xs">
                      {Object.keys(Characters[game]).map((character) => (
                        <SelectItem key={character} value={character} className="text-xs">
                          {character}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}
  
          {/* Net Price */}
          <div className="space-y-1.5">
            <Label className="text-xs">Net Price:</Label>
            <div className="flex h-8 w-1/3 items-center rounded-md border border-input bg-background px-3 py-1 text-sm focus-within:border-ai-cyan focus-within:ring-1 focus-within:ring-ai-cyan transition duration-150">
              <Input
                type="text"
                value={netPriceInput}
                onChange={(e) => handleNetPriceChange(e.target.value)}
                className="flex-1 border-0 h-6 p-0 text-xs text-right shadow-none focus-visible:ring-0"
                maxLength={5}
              />
              <span className="ml-1 text-xs text-muted-foreground">K</span>
            </div>
          </div>
  
          {/* Starter Account Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="starter-account"
              checked={isStarterAccount}
              onCheckedChange={(checked) => setIsStarterAccount(checked === true)}
              className="h-3.5 w-3.5 border-ai-cyan text-ai-cyan focus:ring-ai-cyan data-[state=checked]:bg-ai-cyan data-[state=checked]:border-ai-cyan"
            />
            <Label htmlFor="starter-account" className="text-xs font-normal">
              Starter account?
            </Label>
          </div>
  
          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-xs">Description:</Label>
            <div className="relative">
              <Textarea
                value={descriptionInput}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={MAX_TOTAL_CHARS}
                placeholder={`Max ${MAX_CHARS_PER_LINE} chars per line, ${MAX_LINES} lines max`}
                rows={4}
                className={`min-h-[100px] text-xs resize-none border-input focus:border-ai-cyan focus-visible:ring-ai-cyan focus-visible:ring-1 ${
                  hasLineWarning || lineCountWarning ? 'border-yellow-500' : ''
                }`}
              />
              <div className={`absolute bottom-1 right-2 text-[10px] ${
                hasLineWarning || lineCountWarning ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {descriptionInput.length}/{MAX_TOTAL_CHARS} | {lineCount}/{MAX_LINES} lines
                {lineCountWarning && " (too many lines)"}
              </div>
              
              {/* Line length warnings */}
              {hasLineWarning && (
                <div className="absolute top-1 right-2 text-[10px] text-yellow-600">
                  Some lines exceed {MAX_CHARS_PER_LINE} characters
                </div>
              )}
            </div>
          </div>
  
          {/* Download Button */}
          <div className="pt-2">
            {imageUrl && <DownloadButton imageUrl={imageUrl} postCode={"AAA" + code} />}
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostForm
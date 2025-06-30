"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Characters } from "../data/characters"
import { useDebounce } from "@/hooks/useDebounce"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

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
  resetTrigger?: number; // Add this prop to trigger reset
}

const PostForm: React.FC<PostFormProps> = ({ onFormChange, imageUrl, resetTrigger }) => {
  const [selectedPostType, setSelectedPostType] = useState<string>("New")

  // For code prefix toggle
  const [codePrefix, setCodePrefix] = useState<string>("AAA")

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

  const handleCodePrefixToggle = () => {
    setCodePrefix(prev => prev === "AAA" ? "CO" : "AAA")
  }

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

  useEffect(() => {
    // Only call onFormChange when dependencies actually change, not on every render
    if (onFormChange) {
      // Use a ref to track if it's the first render
      const formData = {
        postType: selectedPostType,
        postCode: codePrefix + code,
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
    onFormChange,
    selectedPostType, 
    codePrefix,
    code, 
    selectedGames, 
    selectedCharacters, 
    netPrice, 
    isStarterAccount, 
    description,
  ]);

  useEffect(() => {
    if (resetTrigger) {
      setSelectedPostType("New");
      setCodePrefix("AAA");
      setCodeInput("");
      setSelectedGames([]);
      setSelectedCharacters({});
      setNetPriceInput("");
      setIsStarterAccount(false);
      setDescriptionInput("");
    }
  }, [resetTrigger]);

  // Calculate line and character limits for the textarea
  const MAX_CHARS_PER_LINE = 55
  const MAX_LINES = 4
  const MAX_TOTAL_CHARS = 180

  // Count lines that exceed the character limit
  const lines = descriptionInput.split('\n')
  const lineWarnings = lines.map(line => line.length > MAX_CHARS_PER_LINE)
  const hasLineWarning = lineWarnings.some(warning => warning)
  const lineCount = lines.length
  const lineCountWarning = lineCount > MAX_LINES

  return (
    <div className="w-full lg:w-1/3 xl:w-1/4">
      {/* Form Section */}
      <div className="bg-white p-6 shadow-md lg:h-full overflow-y-auto">
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">Configure Post</h2>
  
          {/* Post Type Selection */}
          <div className="space-y-1.5">
            <Label className="text-base">Post Type:</Label>
            <RadioGroup value={selectedPostType} onValueChange={setSelectedPostType} className="flex space-x-4">
              {["New", "Drop", "Repost"].map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={type} 
                    id={`type-${type}`} 
                    className="h-3.5 w-3.5 border-ai-cyan text-ai-cyan focus:ring-ai-cyan" 
                  />
                  <Label htmlFor={`type-${type}`} className="text-base font-normal">
                    {type}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
  
          {/* Code Input */}
          <div className="space-y-1.5">
            <Label className=" text-base">Code:</Label>
            <div className="flex w-full xl:w-1/3 items-center rounded-md border border-input bg-background focus-within:border-ai-cyan focus-within:ring-1 focus-within:ring-ai-cyan transition duration-150">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCodePrefixToggle}
                className="px-2 py-1 text-base text-muted-foreground hover:text-ai-cyan hover:bg-ai-cyan/10 transition-colors duration-150 border-0 rounded-none"
              >
                {codePrefix}
              </Button>
              <Input
                type="text"
                value={codeInput}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="flex-1 items-center border-0 p-0 pl-1 text-base shadow-none focus-visible:ring-0"
                maxLength={4}
              />
            </div>
          </div>
  
          {/* Game Selection */}
          <div className="space-y-1.5">
            <Label className="text-base">Select Games:</Label>
            <div className="grid grid-cols-3 gap-1.5">
              {Object.keys(Characters).map((game) => (
                <div key={game} className="flex items-center space-x-1.5">
                  <Checkbox
                    id={`game-${game}`}
                    checked={selectedGames.includes(game)}
                    onCheckedChange={() => handleGameChange(game)}
                    disabled={!selectedGames.includes(game) && selectedGames.length >= 3}
                    className="h-4 w-4 border-ai-cyan text-ai-cyan focus:ring-ai-cyan data-[state=checked]:bg-ai-cyan data-[state=checked]:border-ai-cyan"
                  />
                  <Label htmlFor={`game-${game}`} className="text-base font-normal">
                    {game.toUpperCase()}
                  </Label>
                </div>
              ))}
            </div>
          </div>
  
          {/* Character Selection */}
          {selectedGames.length > 0 && (
            <div className="space-y-2">
              <Label className="text-base">Character Selection:</Label>
              {selectedGames.map((game) => (
                <div key={game} className="flex items-center space-x-2">
                  <span className="text-sm font-medium bg-ai-cyan text-white px-2 py-0.5 rounded w-20 text-center">
                    {game.toUpperCase()}
                  </span>
                  <Select
                    value={selectedCharacters[game] || ""}
                    onValueChange={(value) => handleCharacterChange(game, value)}
                  >
                    <SelectTrigger className="flex-1 text-base border-input focus:border-ai-cyan focus:ring-1 focus:ring-ai-cyan">
                      <SelectValue placeholder="Select a Character" />
                    </SelectTrigger>
                    <SelectContent className="text-base max-h-[300px] overflow-y-auto">
                      {Object.keys(Characters[game])
                        .sort((a, b) => a.localeCompare(b))  // Sort alphabetically
                        .map((character) => (
                          <SelectItem key={character} value={character} className="text-base">
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
            <Label className="text-base">Net Price:</Label>
            <div className="flex w-full xl:w-1/3 items-center rounded-md border border-input bg-background px-3 text-base focus-within:border-ai-cyan focus-within:ring-1 focus-within:ring-ai-cyan transition duration-150">
              <Input
                type="text"
                value={netPriceInput}
                onChange={(e) => handleNetPriceChange(e.target.value)}
                className="flex-1 border-0 text-base text-right shadow-none focus-visible:ring-0"
                maxLength={5}
              />
              <span className="ml-1 text-base text-muted-foreground">K</span>
            </div>
          </div>
  
          {/* Starter Account Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="starter-account"
              checked={isStarterAccount}
              onCheckedChange={(checked) => setIsStarterAccount(checked === true)}
              className="h-4 w-4 border-ai-cyan text-ai-cyan focus:ring-ai-cyan data-[state=checked]:bg-ai-cyan data-[state=checked]:border-ai-cyan"
            />
            <Label htmlFor="starter-account" className="text-base font-normal">
              Starter account?
            </Label>
          </div>
  
          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-base">Description:</Label>
            <div className="relative">
              <Textarea
                value={descriptionInput}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                maxLength={MAX_TOTAL_CHARS}
                placeholder={`Max ${MAX_CHARS_PER_LINE} chars per line, ${MAX_LINES} lines max`}
                rows={4}
                className={`min-h-[100px] text-base resize-none border-input focus:border-ai-cyan focus-visible:ring-ai-cyan focus-visible:ring-1 ${
                  hasLineWarning || lineCountWarning ? 'border-yellow-500' : ''
                }`}
              />
              <div className={`absolute bottom-1 right-2 text-[12px] ${
                hasLineWarning || lineCountWarning ? 'text-yellow-600' : 'text-muted-foreground'
              }`}>
                {descriptionInput.length}/{MAX_TOTAL_CHARS} | {lineCount}/{MAX_LINES} lines
                {lineCountWarning && " (too many lines)"}
              </div>
              
              {/* Line length warnings */}
              {hasLineWarning && (
                <div className="absolute bottom-1 left-2 text-[12px] text-yellow-600">
                  Some lines exceed {MAX_CHARS_PER_LINE} characters
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PostForm
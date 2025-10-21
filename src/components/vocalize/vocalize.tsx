'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  VolumeX,
  Loader2,
  Wand2,
} from 'lucide-react';
import { suggestSuitableVoices } from '@/ai/flows/voice-selection-assistance';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { SoundWave } from './sound-wave';

const BRAND_VOICES = [{ name: 'Algenib' }, { name: 'Achernar' }];

type PlaybackStatus = 'idle' | 'playing' | 'paused';

export default function VocalizeClient() {
  const [text, setText] = useState(
    'Hello, world! This is Vocalize, turning your text into speech with AI-powered voice selection.'
  );
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState<string>(
    BRAND_VOICES[0].name
  );
  const [volume, setVolume] = useState(0.8);
  const [rate, setRate] = useState(1);
  const [status, setStatus] = useState<PlaybackStatus>('idle');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [suggestedVoices, setSuggestedVoices] = useState<string[]>([]);
  const { toast } = useToast();

  const mappedVoices = useMemo(() => {
    if (voices.length === 0) return {};
    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    const voice1 =
      enVoices.find(v => v.name.includes('Female')) || enVoices[0];
    const voice2 =
      enVoices.find(v => v.name.includes('Male')) ||
      enVoices.find(v => v !== voice1) ||
      enVoices[0];

    return {
      Algenib: voice1,
      Achernar: voice2,
    };
  }, [voices]);

  const selectedVoice = mappedVoices[selectedVoiceName as keyof typeof mappedVoices];

  useEffect(() => {
    const handleVoicesChanged = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
    handleVoicesChanged(); // initial load
    return () => {
      window.speechSynthesis.removeEventListener(
        'voiceschanged',
        handleVoicesChanged
      );
      window.speechSynthesis.cancel(); // cleanup on unmount
    };
  }, []);

  const utterance = useMemo(() => {
    if (typeof window === 'undefined' || !text) return null;
    const u = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      u.voice = selectedVoice;
    }
    u.volume = volume;
    u.rate = rate;
    u.onstart = () => setStatus('playing');
    u.onpause = () => setStatus('paused');
    u.onresume = () => setStatus('playing');
    u.onend = () => setStatus('idle');
    u.onerror = () => setStatus('idle');
    return u;
  }, [text, selectedVoice, volume, rate]);

  const handlePlayPause = useCallback(() => {
    if (!utterance) return;
    if (status === 'playing') {
      window.speechSynthesis.pause();
    } else if (status === 'paused') {
      window.speechSynthesis.resume();
    } else {
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }
  }, [status, utterance]);

  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setStatus('idle');
  }, []);

  const handleGetSuggestion = async () => {
    if (!text.trim()) {
      toast({
        variant: 'destructive',
        title: 'Input needed',
        description: 'Please enter some text to get a voice suggestion.',
      });
      return;
    }
    setIsAiLoading(true);
    setSuggestedVoices([]);
    try {
      const result = await suggestSuitableVoices({ inputText: text });
      setSuggestedVoices(result.suggestedVoices);
      if (result.suggestedVoices.length > 0) {
        toast({
          title: 'Suggestion Ready!',
          description: `We recommend using ${result.suggestedVoices.join(
            ' or '
          )}.`,
        });
      }
    } catch (error) {
      console.error('AI suggestion failed:', error);
      toast({
        variant: 'destructive',
        title: 'AI Error',
        description: 'Could not get a voice suggestion at this time.',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enter Your Text</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type or paste your text here..."
            className="min-h-36 text-base"
            rows={6}
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Choose a Voice</CardTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleGetSuggestion}
                disabled={isAiLoading || !text.trim()}
                aria-label="Suggest a voice"
              >
                {isAiLoading ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Wand2 />
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {voices.length === 0 ? (
              <div className="flex items-center justify-center h-24">
                <Loader2 className="animate-spin text-muted-foreground" />
                <p className="ml-2 text-muted-foreground">Loading voices...</p>
              </div>
            ) : (
              <RadioGroup
                value={selectedVoiceName}
                onValueChange={setSelectedVoiceName}
                className="space-y-2"
              >
                {BRAND_VOICES.map(brandVoice => (
                  <Label
                    key={brandVoice.name}
                    htmlFor={brandVoice.name}
                    className="flex items-center justify-between p-4 rounded-lg border has-[:checked]:bg-accent has-[:checked]:border-primary cursor-pointer transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="font-semibold">{brandVoice.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {mappedVoices[
                          brandVoice.name as keyof typeof mappedVoices
                        ]?.name ?? 'Default'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {suggestedVoices.includes(brandVoice.name) && (
                        <Badge variant="secondary">AI Pick</Badge>
                      )}
                      <RadioGroupItem
                        value={brandVoice.name}
                        id={brandVoice.name}
                      />
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl">Playback Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={handlePlayPause}
                disabled={!text.trim() || voices.length === 0}
                className="w-32"
              >
                {status === 'playing' ? <Pause /> : <Play />}
                <span className="ml-2">
                  {status === 'playing'
                    ? 'Pause'
                    : status === 'paused'
                    ? 'Resume'
                    : 'Play'}
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleStop}
                disabled={status === 'idle'}
                className="w-32"
              >
                <Square />
                <span className="ml-2">Stop</span>
              </Button>
              <SoundWave
                className={status === 'playing' ? 'opacity-100' : 'opacity-0 transition-opacity'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="volume-slider">Volume</Label>
                <div className="flex items-center gap-2">
                  <VolumeX className="text-muted-foreground" />
                  <Slider
                    id="volume-slider"
                    min={0}
                    max={1}
                    step={0.1}
                    value={[volume]}
                    onValueChange={value => setVolume(value[0])}
                  />
                  <Volume2 className="text-muted-foreground" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="speed-slider" className="flex justify-between">
                  <span>Speed</span>
                  <span>{rate.toFixed(1)}x</span>
                </Label>
                <Slider
                  id="speed-slider"
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[rate]}
                  onValueChange={value => setRate(value[0])}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

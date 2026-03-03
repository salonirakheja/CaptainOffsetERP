'use client';

import { useState, useEffect, useRef } from 'react';
import { getSession, setSession, clearSession, type SessionData } from '@/lib/session';

interface Person {
  id: number;
  name: string;
  role: string;
  factoryId: number;
}

interface Factory {
  id: number;
  name: string;
  code: string;
}

const ROLE_LABELS: Record<string, string> = {
  security: 'Security',
  store: 'Store',
  production: 'Production',
  dispatch: 'Dispatch',
  design: 'Design',
  management: 'Management',
};

export default function SessionSelector({ people, factories }: { people: Person[]; factories: Factory[] }) {
  const [show, setShow] = useState(false);
  const [current, setCurrent] = useState<SessionData | null>(null);
  const [step, setStep] = useState<'factory' | 'person' | 'pin' | 'change_pin'>('factory');
  const [selectedFactory, setSelectedFactory] = useState<Factory | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [changePinStep, setChangePinStep] = useState<'current' | 'new' | 'confirm'>('current');
  const [currentPinValue, setCurrentPinValue] = useState('');
  const [newPinValue, setNewPinValue] = useState('');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const session = getSession();
    if (session) {
      setCurrent(session);
    } else {
      setShow(true);
    }
    // Auto-select factory if only one exists
    if (factories.length === 1) {
      setSelectedFactory(factories[0]);
      setStep('person');
    }
  }, [factories]);

  function openModal() {
    setShow(true);
    setStep(factories.length === 1 ? 'person' : 'factory');
    if (factories.length === 1) setSelectedFactory(factories[0]);
    setSelectedPerson(null);
    setPin(['', '', '', '']);
    setError('');
  }

  function selectFactory(f: Factory) {
    setSelectedFactory(f);
    setStep('person');
    setError('');
  }

  function selectPerson(p: Person) {
    setSelectedPerson(p);
    setStep('pin');
    setPin(['', '', '', '']);
    setError('');
    setTimeout(() => pinRefs.current[0]?.focus(), 50);
  }

  function handlePinChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 4 digits entered
    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value.slice(-1)].join('');
      if (fullPin.length === 4) {
        verifyAndLogin(fullPin);
      }
    }
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  }

  async function verifyAndLogin(fullPin: string) {
    if (!selectedPerson || !selectedFactory) return;
    setVerifying(true);

    try {
      const res = await fetch('/api/auth/verify-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: selectedPerson.id, pin: fullPin }),
      });
      const data = await res.json();

      if (data.success) {
        const session: SessionData = {
          personId: selectedPerson.id,
          personName: selectedPerson.name,
          factoryId: selectedFactory.id,
          role: selectedPerson.role,
        };
        setSession(session);
        setCurrent(session);
        setShow(false);
      } else {
        setError('Wrong PIN. Try again.');
        setPin(['', '', '', '']);
        setTimeout(() => pinRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError('Verification failed. Try again.');
      setPin(['', '', '', '']);
    }

    setVerifying(false);
  }

  function openChangePin() {
    setStep('change_pin');
    setChangePinStep('current');
    setCurrentPinValue('');
    setNewPinValue('');
    setPin(['', '', '', '']);
    setError('');
    setTimeout(() => pinRefs.current[0]?.focus(), 50);
  }

  function handleChangePinDigit(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value.slice(-1);
    setPin(newPin);
    setError('');

    if (value && index < 3) {
      pinRefs.current[index + 1]?.focus();
    }

    if (index === 3 && value) {
      const fullPin = [...newPin.slice(0, 3), value.slice(-1)].join('');
      if (fullPin.length === 4) {
        if (changePinStep === 'current') {
          setCurrentPinValue(fullPin);
          setChangePinStep('new');
          setPin(['', '', '', '']);
          setTimeout(() => pinRefs.current[0]?.focus(), 50);
        } else if (changePinStep === 'new') {
          setNewPinValue(fullPin);
          setChangePinStep('confirm');
          setPin(['', '', '', '']);
          setTimeout(() => pinRefs.current[0]?.focus(), 50);
        } else if (changePinStep === 'confirm') {
          if (fullPin !== newPinValue) {
            setError('PINs do not match. Try again.');
            setChangePinStep('new');
            setNewPinValue('');
            setPin(['', '', '', '']);
            setTimeout(() => pinRefs.current[0]?.focus(), 50);
          } else {
            submitPinChange(currentPinValue, fullPin);
          }
        }
      }
    }
  }

  async function submitPinChange(oldPin: string, newPin: string) {
    if (!current) return;
    setVerifying(true);
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personId: current.personId, currentPin: oldPin, newPin }),
      });
      const data = await res.json();
      if (data.success) {
        setError('');
        setShow(false);
        // Brief visual confirmation
        alert('PIN changed successfully!');
      } else {
        setError(data.error || 'Failed to change PIN');
        setChangePinStep('current');
        setCurrentPinValue('');
        setNewPinValue('');
        setPin(['', '', '', '']);
        setTimeout(() => pinRefs.current[0]?.focus(), 50);
      }
    } catch {
      setError('Something went wrong. Try again.');
    }
    setVerifying(false);
  }

  function handleLogout() {
    clearSession();
    setCurrent(null);
    openModal();
  }

  const factoryPeople = selectedFactory
    ? people.filter((p) => p.factoryId === selectedFactory.id)
    : [];

  if (!show && current) {
    return (
      <button
        onClick={() => setShow(true)}
        className="no-print fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm shadow-sm hover:shadow-md transition-shadow flex items-center gap-2"
      >
        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
        <span>{current.personName}</span>
        <span className="text-xs text-gray-400 capitalize px-1.5 py-0.5 bg-gray-100 rounded">
          {ROLE_LABELS[current.role] || current.role}
        </span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 p-6">
        {/* Step 1: Factory */}
        {step === 'factory' && (
          <>
            <h2 className="text-lg font-semibold mb-1">Select Factory</h2>
            <p className="text-sm text-gray-500 mb-4">Choose your factory to continue</p>
            <div className="space-y-2">
              {factories.map((f) => (
                <button
                  key={f.id}
                  onClick={() => selectFactory(f)}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-accent hover:bg-orange-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium">{f.name}</span>
                  <span className="text-xs text-gray-400 font-mono">{f.code}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Step 2: Person */}
        {step === 'person' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              {factories.length > 1 && (
                <button onClick={() => setStep('factory')} className="text-gray-400 hover:text-gray-600">&larr;</button>
              )}
              <h2 className="text-lg font-semibold">Who are you?</h2>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              {selectedFactory?.name} &middot; Select your name
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {factoryPeople.map((p) => (
                <button
                  key={p.id}
                  onClick={() => selectPerson(p)}
                  className="w-full text-left px-4 py-2.5 rounded-lg border border-gray-200 hover:border-accent hover:bg-orange-50 transition-colors flex items-center justify-between"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="text-xs text-gray-400 capitalize">{ROLE_LABELS[p.role] || p.role}</span>
                </button>
              ))}
              {factoryPeople.length === 0 && (
                <p className="text-gray-400 text-center py-4">No people found for this factory</p>
              )}
            </div>
          </>
        )}

        {/* Step 3: PIN */}
        {step === 'pin' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => { setStep('person'); setError(''); }} className="text-gray-400 hover:text-gray-600">&larr;</button>
              <h2 className="text-lg font-semibold">Enter PIN</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              Hi {selectedPerson?.name}! Enter your 4-digit PIN.
            </p>
            <div className="flex justify-center gap-3 mb-4">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handlePinChange(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-accent focus:outline-none"
                  maxLength={1}
                  disabled={verifying}
                />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
            {verifying && <p className="text-gray-400 text-sm text-center">Verifying...</p>}
          </>
        )}

        {/* Step 4: Change PIN */}
        {step === 'change_pin' && (
          <>
            <div className="flex items-center gap-2 mb-1">
              <button onClick={() => { setStep('factory'); setError(''); }} className="text-gray-400 hover:text-gray-600">&larr;</button>
              <h2 className="text-lg font-semibold">Change PIN</h2>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              {changePinStep === 'current' && 'Enter your current PIN'}
              {changePinStep === 'new' && 'Enter your new PIN'}
              {changePinStep === 'confirm' && 'Confirm your new PIN'}
            </p>
            <div className="flex justify-center gap-3 mb-4">
              {pin.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { pinRefs.current[i] = el; }}
                  type="password"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handleChangePinDigit(i, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(i, e)}
                  className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-accent focus:outline-none"
                  maxLength={1}
                  disabled={verifying}
                />
              ))}
            </div>
            {/* Step indicator */}
            <div className="flex justify-center gap-2 mb-3">
              {['current', 'new', 'confirm'].map((s) => (
                <div key={s} className={`w-2 h-2 rounded-full ${changePinStep === s ? 'bg-accent' : 'bg-gray-200'}`} />
              ))}
            </div>
            {error && <p className="text-red-500 text-sm text-center mb-3">{error}</p>}
            {verifying && <p className="text-gray-400 text-sm text-center">Saving...</p>}
          </>
        )}

        {/* Footer: Cancel / Change PIN / Log Out */}
        {current && step !== 'change_pin' && (
          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <button
              onClick={() => setShow(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
            <div className="flex gap-3">
              <button
                onClick={openChangePin}
                className="text-sm text-accent hover:text-orange-700 font-medium"
              >
                Change PIN
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700 font-medium"
              >
                Log Out
              </button>
            </div>
          </div>
        )}
        {current && step === 'change_pin' && (
          <div className="mt-4 pt-4 border-t">
            <button
              onClick={() => setShow(false)}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

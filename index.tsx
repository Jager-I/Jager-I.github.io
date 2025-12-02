import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { Ship, Users, Edit2, Save, X, Plus, Clock, Trash2, CheckCircle2, Share2, Sun, Moon, Anchor } from 'lucide-react';

// --- Types ---
interface Boat {
  id: string;
  name: string;
  capacity: number;
}

interface BoatAssignment {
  boatId: string;
  boatName: string;
  capacity: number;
  passengerCount: number;
  passengerNames?: string[];
}

interface TripWave {
  id: string;
  departureTime: string;
  boats: BoatAssignment[];
}

interface Schedule {
  outbound: TripWave[];
  inbound: TripWave[];
}

enum AppState {
  EDITOR = 'EDITOR',
  VIEW_ONLY = 'VIEW_ONLY',
}

// --- Components ---

// 1. BoatCard
interface BoatCardProps {
  boat?: Boat;
  assignment?: BoatAssignment;
  onRemove?: () => void;
  onClick?: () => void;
  isCompact?: boolean;
}

const BoatCard: React.FC<BoatCardProps> = ({ boat, assignment, onRemove, onClick, isCompact = false }) => {
  const name = boat?.name || assignment?.boatName;
  const capacity = boat?.capacity;
  const passengers = assignment?.passengerCount;
  const passengerNames = assignment?.passengerNames || [];

  if (isCompact) {
    return (
      <div 
        onClick={onClick}
        className={`group relative flex flex-col bg-white/60 p-3 rounded-lg border border-sky-100 shadow-sm transition-all ${onClick ? 'cursor-pointer hover:bg-white hover:shadow-md hover:border-sky-300' : ''}`}
      >
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-sky-100 rounded-full text-sky-600">
              <Ship size={16} />
            </div>
            <span className="font-medium text-slate-700 text-sm">{name}</span>
          </div>
          <div className="flex items-center gap-1 text-sky-700 text-sm font-semibold">
            <Users size={14} />
            <span>{passengers}</span>
          </div>
        </div>

        {/* Name Preview */}
        {passengerNames.length > 0 && (
          <div className="pl-8 text-xs text-slate-500 truncate w-full">
            {passengerNames.slice(0, 3).join(', ')}
            {passengerNames.length > 3 && ` +${passengerNames.length - 3}`}
          </div>
        )}
        
        {onClick && (
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Edit2 size={12} className="text-sky-400" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
          <Ship size={20} />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800">{name}</h3>
          <p className="text-xs text-slate-500">Capacidad: {capacity} pax</p>
        </div>
      </div>
      {onRemove && (
        <button
          onClick={onRemove}
          className="text-red-400 hover:text-red-600 p-2 transition-colors"
          aria-label="Eliminar lancha"
        >
          &times;
        </button>
      )}
    </div>
  );
};

// 2. EditAssignmentModal
interface EditAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignment: BoatAssignment;
  onSave: (updated: BoatAssignment) => void;
  waveTime: string;
}

const EditAssignmentModal: React.FC<EditAssignmentModalProps> = ({ 
  isOpen, 
  onClose, 
  assignment, 
  onSave,
  waveTime
}) => {
  const [names, setNames] = useState<string>('');
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setNames(assignment.passengerNames?.join('\n') || '');
      setCount(assignment.passengerCount);
    }
  }, [isOpen, assignment]);

  if (!isOpen) return null;

  const handleSave = () => {
    const nameList = names.split('\n').map(n => n.trim()).filter(n => n.length > 0);
    const finalCount = nameList.length > 0 ? nameList.length : count;
    
    onSave({
      ...assignment,
      passengerNames: nameList,
      passengerCount: finalCount
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
        <div className="bg-sky-50 p-4 border-b border-sky-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">{assignment.boatName}</h3>
            <p className="text-xs text-sky-600 font-medium">Salida: {waveTime}</p>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white rounded-full transition-colors text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
              <Users size={14} /> Pasajeros (1 por línea)
            </label>
            <textarea
              value={names}
              onChange={(e) => setNames(e.target.value)}
              placeholder="Ej: Juan Pérez&#10;María Gomez&#10;Pedro"
              className="w-full h-32 p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-sky-500 outline-none text-sm text-slate-700 resize-none"
            />
            <p className="text-[10px] text-slate-400 text-right">
              {names.split('\n').filter(n => n.trim().length > 0).length} nombres detectados
            </p>
          </div>
          <div className="space-y-2">
             <label className="text-xs font-bold text-slate-500 uppercase">
              Cantidad Manual (Si no usas nombres)
            </label>
            <input 
              type="number" 
              min="0"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-bold"
            />
          </div>
        </div>
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl font-semibold text-slate-500 hover:bg-white border border-transparent hover:border-slate-200 transition-all"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl font-bold text-white bg-sky-500 hover:bg-sky-600 shadow-lg shadow-sky-200 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={18} /> Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. FleetManager
interface FleetManagerProps {
  boats: Boat[];
  onUpdateBoats: (boats: Boat[]) => void;
  isReadOnly?: boolean;
}

const FleetManager: React.FC<FleetManagerProps> = ({ boats, onUpdateBoats, isReadOnly = false }) => {
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('5');
  const [isOpen, setIsOpen] = useState(true);

  if (isReadOnly) return null;

  const addBoat = () => {
    if (!name) return;
    const newBoat: Boat = {
      id: Date.now().toString(),
      name,
      capacity: parseInt(capacity) || 1,
    };
    onUpdateBoats([...boats, newBoat]);
    setName('');
    setCapacity('5');
  };

  const removeBoat = (id: string) => {
    onUpdateBoats(boats.filter(b => b.id !== id));
  };

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-white/50 shadow-sm overflow-hidden mb-6 w-full">
      <div 
        className="bg-sky-50/50 p-4 flex justify-between items-center cursor-pointer hover:bg-sky-50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <h3 className="font-bold text-slate-700 flex items-center gap-2">
          <Anchor size={18} className="text-sky-600" />
          Mi Flota de Lanchas ({boats.length})
        </h3>
        <span className="text-xs text-sky-600 font-medium">{isOpen ? 'Ocultar' : 'Editar Flota'}</span>
      </div>

      {isOpen && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre (ej. Lancha Roja)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <input
              type="number"
              placeholder="Cap."
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-16 p-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 outline-none text-center"
            />
            <button
              onClick={addBoat}
              className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-lg transition-colors shadow-sm"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {boats.map(boat => (
              <div key={boat.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-sky-100 rounded text-sky-600">
                    <Ship size={14} />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-700 leading-tight">{boat.name}</div>
                    <div className="text-[10px] text-slate-400">Cap: {boat.capacity} pax</div>
                  </div>
                </div>
                <button 
                  onClick={() => removeBoat(boat.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {boats.length === 0 && (
              <p className="text-sm text-slate-400 italic col-span-2 text-center py-2">
                Agrega lanchas para asignarlas a los viajes.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// 4. ScheduleView
interface ScheduleViewProps {
  schedule: Schedule;
  fleet: Boat[];
  onUpdateSchedule: (schedule: Schedule) => void;
  isReadOnly?: boolean;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({ schedule, fleet, onUpdateSchedule, isReadOnly = false }) => {
  const [activeTab, setActiveTab] = useState<'outbound' | 'inbound'>('outbound');
  const [editingAssignment, setEditingAssignment] = useState<{ waveId: string, boatIndex: number } | null>(null);
  const [addingBoatToWaveId, setAddingBoatToWaveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const waves = activeTab === 'outbound' ? schedule.outbound : schedule.inbound;
  const isDay = activeTab === 'outbound';

  const handleShare = () => {
    const data = { schedule, fleet };
    const json = JSON.stringify(data);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const url = `${window.location.origin}${window.location.pathname}?data=${encoded}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const addWave = () => {
    const newWave: TripWave = {
      id: Date.now().toString(),
      departureTime: isDay ? '14:00' : '20:00',
      boats: []
    };
    
    const newSchedule = { ...schedule };
    if (activeTab === 'outbound') {
      newSchedule.outbound.push(newWave);
      newSchedule.outbound.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    } else {
      newSchedule.inbound.push(newWave);
      newSchedule.inbound.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    onUpdateSchedule(newSchedule);
  };

  const removeWave = (waveId: string) => {
    if (!confirm('¿Borrar esta tanda completa?')) return;
    const newSchedule = { ...schedule };
    if (activeTab === 'outbound') {
      newSchedule.outbound = newSchedule.outbound.filter(w => w.id !== waveId);
    } else {
      newSchedule.inbound = newSchedule.inbound.filter(w => w.id !== waveId);
    }
    onUpdateSchedule(newSchedule);
  };

  const updateWaveTime = (waveId: string, time: string) => {
    const newSchedule = { ...schedule };
    const targetArray = activeTab === 'outbound' ? newSchedule.outbound : newSchedule.inbound;
    const wave = targetArray.find(w => w.id === waveId);
    if (wave) {
      wave.departureTime = time;
      targetArray.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
    }
    onUpdateSchedule(newSchedule);
  };

  const addBoatToWave = (waveId: string, boat: Boat) => {
    const newSchedule = { ...schedule };
    const targetArray = activeTab === 'outbound' ? newSchedule.outbound : newSchedule.inbound;
    const wave = targetArray.find(w => w.id === waveId);
    if (wave) {
      const assignment: BoatAssignment = {
        boatId: boat.id,
        boatName: boat.name,
        capacity: boat.capacity,
        passengerCount: 0,
        passengerNames: []
      };
      wave.boats.push(assignment);
    }
    onUpdateSchedule(newSchedule);
    setAddingBoatToWaveId(null);
  };

  const removeBoatFromWave = (waveId: string, boatIndex: number) => {
    const newSchedule = { ...schedule };
    const targetArray = activeTab === 'outbound' ? newSchedule.outbound : newSchedule.inbound;
    const wave = targetArray.find(w => w.id === waveId);
    if (wave) {
      wave.boats.splice(boatIndex, 1);
    }
    onUpdateSchedule(newSchedule);
  };

  const handleSaveAssignment = (updated: BoatAssignment) => {
    if (!editingAssignment) return;
    const newSchedule = { ...schedule };
    const targetArray = activeTab === 'outbound' ? newSchedule.outbound : newSchedule.inbound;
    const wave = targetArray.find(w => w.id === editingAssignment.waveId);
    if (wave) {
      wave.boats[editingAssignment.boatIndex] = updated;
    }
    onUpdateSchedule(newSchedule);
    setEditingAssignment(null);
  };

  const getEditingData = () => {
    if (!editingAssignment) return { waveTime: '', assignment: null };
    const targetArray = activeTab === 'outbound' ? schedule.outbound : schedule.inbound;
    const wave = targetArray.find(w => w.id === editingAssignment.waveId);
    return {
      waveTime: wave?.departureTime || '',
      assignment: wave ? wave.boats[editingAssignment.boatIndex] : null
    };
  };

  const { waveTime, assignment } = getEditingData();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="flex justify-end">
        <button 
           onClick={handleShare}
           className="text-xs font-bold text-white bg-sky-500 hover:bg-sky-600 px-4 py-2 rounded-full transition-all shadow-lg shadow-sky-200 flex items-center gap-2 active:scale-95"
         >
           {copied ? <CheckCircle2 size={16} /> : <Share2 size={16} />}
           {copied ? 'Link Copiado' : 'Compartir Cronograma'}
         </button>
      </div>

      <div className="flex p-1 bg-white/60 backdrop-blur rounded-2xl border border-slate-200/60">
        <button
          onClick={() => setActiveTab('outbound')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'outbound' 
              ? 'bg-white text-sky-600 shadow-md ring-1 ring-slate-100' 
              : 'text-slate-500 hover:bg-white/50'
          }`}
        >
          <Sun size={18} className={activeTab === 'outbound' ? 'text-amber-500' : ''} />
          IDA
        </button>
        <button
          onClick={() => setActiveTab('inbound')}
          className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'inbound' 
              ? 'bg-white text-indigo-600 shadow-md ring-1 ring-slate-100' 
              : 'text-slate-500 hover:bg-white/50'
          }`}
        >
          <Moon size={18} className={activeTab === 'inbound' ? 'text-indigo-500' : ''} />
          VUELTA
        </button>
      </div>

      <div className="space-y-6 relative pb-20">
        {waves.length > 0 && (
           <div className="absolute left-[27px] top-6 bottom-6 w-0.5 bg-slate-200 border-l border-dashed border-slate-300"></div>
        )}

        {waves.map((wave) => (
          <div key={wave.id} className="relative pl-16 animate-fade-in-up">
            <div className="absolute left-0 top-0 z-10">
               <div className={`h-14 w-14 rounded-2xl flex flex-col items-center justify-center border-4 border-[#f0f9ff] shadow-sm overflow-hidden ${
                isDay ? 'bg-amber-100 text-amber-700' : 'bg-indigo-100 text-indigo-700'
              }`}>
                 {isReadOnly ? (
                    <span className="text-xs font-bold">{wave.departureTime}</span>
                 ) : (
                    <input 
                      type="time"
                      value={wave.departureTime}
                      onChange={(e) => updateWaveTime(wave.id, e.target.value)}
                      className="w-full h-full bg-transparent text-center text-[10px] font-bold outline-none cursor-pointer hover:bg-black/5"
                    />
                 )}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 hover:shadow-md transition-shadow group relative">
              {!isReadOnly && (
                <button 
                  onClick={() => removeWave(wave.id)}
                  className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 p-1 transition-all"
                  title="Eliminar Tanda"
                >
                  <Trash2 size={14} />
                </button>
              )}

              <div className="mb-3">
                 <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                   <Clock size={14} className="text-slate-400"/> Salida: {wave.departureTime}
                 </h4>
              </div>

              <div className="space-y-2">
                {wave.boats.map((assignedBoat, idx) => (
                  <BoatCard 
                    key={idx}
                    assignment={assignedBoat}
                    isCompact
                    onRemove={isReadOnly ? undefined : () => removeBoatFromWave(wave.id, idx)}
                    onClick={isReadOnly ? undefined : () => setEditingAssignment({ waveId: wave.id, boatIndex: idx })}
                  />
                ))}

                {wave.boats.length === 0 && (
                  <div className="text-xs text-slate-400 italic py-2">Sin lanchas asignadas.</div>
                )}

                {!isReadOnly && (
                  <div className="relative">
                    {addingBoatToWaveId === wave.id ? (
                      <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 animate-fade-in">
                        <div className="text-xs font-semibold text-slate-500 mb-2 uppercase">Seleccionar de la flota:</div>
                        <div className="grid grid-cols-2 gap-2">
                          {fleet.map(boat => (
                            <button
                              key={boat.id}
                              onClick={() => addBoatToWave(wave.id, boat)}
                              className="text-left p-2 bg-white rounded border border-slate-200 hover:border-sky-300 hover:bg-sky-50 text-xs transition-colors flex items-center gap-2"
                            >
                              <Ship size={12} className="text-sky-500"/>
                              <span className="truncate">{boat.name}</span>
                            </button>
                          ))}
                        </div>
                        <button 
                          onClick={() => setAddingBoatToWaveId(null)}
                          className="mt-2 text-xs text-red-400 hover:text-red-600 underline w-full text-center"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setAddingBoatToWaveId(wave.id)}
                        className="w-full py-2 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-xs font-bold hover:border-sky-300 hover:text-sky-500 transition-colors flex items-center justify-center gap-1"
                      >
                        <Plus size={14} /> Asignar Lancha
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {!isReadOnly && (
           <div className="pl-16">
              <button
                onClick={addWave}
                className="w-full py-4 bg-white border-2 border-dashed border-sky-200 rounded-2xl text-sky-500 font-bold hover:bg-sky-50 hover:border-sky-300 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={20} />
                Agregar Tanda {activeTab === 'outbound' ? 'Ida' : 'Vuelta'}
              </button>
           </div>
        )}
      </div>

      {assignment && (
        <EditAssignmentModal 
          isOpen={!!assignment}
          onClose={() => setEditingAssignment(null)}
          assignment={assignment}
          waveTime={waveTime}
          onSave={handleSaveAssignment}
        />
      )}
    </div>
  );
};

// 5. Main App
function App() {
  const [appState, setAppState] = useState<AppState>(AppState.EDITOR);
  const [fleet, setFleet] = useState<Boat[]>([
    { id: '1', name: 'Lancha Principal', capacity: 8 },
    { id: '2', name: 'Bote Auxiliar', capacity: 4 },
  ]);
  const [schedule, setSchedule] = useState<Schedule>({
    outbound: [],
    inbound: []
  });
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const sharedData = searchParams.get('data');

    if (sharedData) {
      try {
        const decodedString = decodeURIComponent(escape(atob(sharedData)));
        const decoded = JSON.parse(decodedString);
        if (decoded.schedule && decoded.fleet) {
          setSchedule(decoded.schedule);
          setFleet(decoded.fleet);
        } else if (decoded.outbound) {
             setSchedule(decoded);
        }
        setAppState(AppState.VIEW_ONLY);
        setIsReadOnly(true);
        return; 
      } catch (e) {
        console.error("Failed to parse shared URL data", e);
      }
    }

    const savedSchedule = localStorage.getItem('nauticPlan_schedule_manual');
    const savedFleet = localStorage.getItem('nauticPlan_fleet');
    if (savedSchedule) try { setSchedule(JSON.parse(savedSchedule)); } catch (e) {}
    if (savedFleet) try { setFleet(JSON.parse(savedFleet)); } catch (e) {}
  }, []);

  const updateSchedule = (newSchedule: Schedule) => {
    setSchedule(newSchedule);
    if (!isReadOnly) localStorage.setItem('nauticPlan_schedule_manual', JSON.stringify(newSchedule));
  };

  const updateFleet = (newFleet: Boat[]) => {
    setFleet(newFleet);
    if (!isReadOnly) localStorage.setItem('nauticPlan_fleet', JSON.stringify(newFleet));
  };

  const handleReset = () => {
    window.location.href = window.location.origin + window.location.pathname;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-50 text-slate-800">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute top-20 -left-20 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>

      <nav className="relative z-10 w-full p-6 flex justify-center">
        <div 
          className="flex items-center gap-2 text-sky-700 font-bold text-xl tracking-tight cursor-pointer" 
          onClick={isReadOnly ? handleReset : undefined}
          title={isReadOnly ? "Crear mi propio cronograma" : "Inicio"}
        >
          <div className="bg-white p-2 rounded-xl shadow-sm border border-sky-100">
            <Anchor className="text-sky-600" size={24} />
          </div>
          Cronograma de Traslados
          {isReadOnly && <span className="text-xs bg-sky-100 px-2 py-1 rounded-full text-sky-600 font-medium ml-2">Solo Lectura</span>}
        </div>
      </nav>

      <main className="relative z-10 px-4 pb-20 pt-4 flex flex-col items-center w-full max-w-2xl mx-auto">
        <FleetManager 
          boats={fleet} 
          onUpdateBoats={updateFleet} 
          isReadOnly={isReadOnly}
        />
        <ScheduleView 
          schedule={schedule}
          fleet={fleet}
          onUpdateSchedule={updateSchedule}
          isReadOnly={isReadOnly}
        />
      </main>
    </div>
  );
}

// --- Entry Point ---

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

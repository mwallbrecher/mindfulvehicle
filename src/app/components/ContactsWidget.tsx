import { Contact } from '../../data/drivingModes';

interface Props {
  contacts: Contact[];
}

/**
 * Low-distraction contacts row — avatar initial + name + relation.
 * No call actions rendered here; the AI can invoke them contextually later.
 */
export function ContactsWidget({ contacts }: Props) {
  if (contacts.length === 0) return null;

  return (
    <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl p-4 border border-slate-700/50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white">Contacts</h3>
        <span className="text-xs text-slate-500">Recents</span>
      </div>

      <div className="space-y-2">
        {contacts.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-slate-700/30 transition-colors"
          >
            <div
              className={`w-8 h-8 rounded-full bg-gradient-to-br ${c.accent} flex items-center justify-center shrink-0`}
            >
              <span className="text-xs font-semibold text-white">{c.name.charAt(0)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white truncate leading-tight">{c.name}</div>
              <div className="text-xs text-slate-500 truncate leading-tight">{c.relation}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

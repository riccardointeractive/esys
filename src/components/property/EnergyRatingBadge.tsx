const ENERGY_COLORS: Record<string, string> = {
  A: '#00a651',
  B: '#51b747',
  C: '#bdd631',
  D: '#fff200',
  E: '#fdb913',
  F: '#f37021',
  G: '#ed1c24',
}

const ENERGY_RATINGS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

interface EnergyRatingBadgeProps {
  rating: string
}

export function EnergyRatingBadge({ rating }: EnergyRatingBadgeProps) {
  const normalized = rating.toUpperCase().charAt(0)
  if (!ENERGY_RATINGS.includes(normalized)) return null

  return (
    <div className="vip-energy">
      {ENERGY_RATINGS.map((letter) => {
        const isActive = letter === normalized
        const color = ENERGY_COLORS[letter]
        return (
          <div
            key={letter}
            className={`vip-energy__bar ${isActive ? 'vip-energy__bar--active' : ''}`}
            style={{
              backgroundColor: isActive ? color : undefined,
              borderColor: color,
            }}
          >
            <span className="vip-energy__letter">{letter}</span>
          </div>
        )
      })}
    </div>
  )
}

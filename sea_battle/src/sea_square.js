export function Square({ value, status, index, onSquareClick, active }) {
  const getClassName = () => {
    switch (value) {
      case 'B': return 'square sqr_mozhno';
      case 'Z': return 'square sqr_zan';
      case 'Y': return 'square';
      case 'X': return 'square sqr_hit';
      case 'M': return 'square sqr_miss';
      case 'C': return 'square sqr_kill';
      case null:
      case undefined:
        return status === 2 ? 'square' : 'square sqr_place';
      case 'O': return 'square sqr_place';
      default: return 'square';
    }
  };

  const handleClick = () => {
    if (!active) return;         
    onSquareClick(index);
  };

  return (
    <button
      className={getClassName()}
      onClick={handleClick}
      disabled={!active}  
      style={{ cursor: active ? 'pointer', padding: '10px' }}
    />
  );
}

export function BoardWithCoordinates({ pl_IsNext, arena, onPlay, name,  active = true  }) {
  const letters = ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  const numbers = ['', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

  let status = "";
  let status_area = 1;

  if (pl_IsNext.indexOf("p1") >= 0) status = "Ход игрока 1";
  if (pl_IsNext.indexOf("p2") >= 0) status = "Ход игрока 2";
  if (pl_IsNext.indexOf("S") >= 0) status_area = 2;

  function handleClick(i) {
    if (!active) return;
    onPlay(pl_IsNext, i);
  }

  return (
    <>
      <div className="status">{status}</div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ display: 'flex', marginBottom: '5px' }}>
          <div style={{ width: '34px', textAlign: 'center' }}></div>
          {letters.slice(1).map((letter, index) => (
            <div key={index} style={{ width: '34px', textAlign: 'center', fontWeight: 'bold', color: '#333' }}>
              {letter}
            </div>
          ))}
        </div>

        {[...Array(10)].map((_, rowIndex) => (
          <div key={rowIndex} style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ width: '34px', textAlign: 'center', fontWeight: 'bold', color: '#333', marginRight: '5px' }}>
              {numbers[rowIndex + 1]}
            </div>
            <div className="board-row">
              {[...Array(10)].map((_, colIndex) => {
                const index = rowIndex * 10 + colIndex;
                return (
                  <Square
                    key={index}
                    value={arena[index]}
                    status={status_area}
                    index={index}
                    active={active}
                    onSquareClick={handleClick}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
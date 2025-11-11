import { Desktop } from './main/Desktop';
import { useSystemStore } from './stores/systemStore';

function App() {
  const { fontSize, fontFamily, fontColor } = useSystemStore();

  return (
    <div style={{ fontSize, fontFamily, color: fontColor }}>
      <Desktop />
    </div>
  );
}

export default App;

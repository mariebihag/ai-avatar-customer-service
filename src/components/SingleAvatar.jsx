import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Individual Avatar Model Component
function AvatarModel({ avatarKey, isActive, isAnimating, currentEmotion, spokenText }) {
  const modelRef = useRef();
  const mixerRef = useRef();
  const clockRef = useRef(new THREE.Clock());

  // Avatar model paths
  const avatarPaths = {
    sarah: '/models/sarah-avatar.glb',
    daisy: '/models/daisy-avatar.glb',
    john: '/models/john-avatar.glb'
  };

  const { scene, animations } = useGLTF(avatarPaths[avatarKey]);

  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;

      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }

    // Set model visibility based on active avatar
    if (scene) {
      scene.visible = isActive;
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, animations, isActive]);

  useFrame(() => {
    if (mixerRef.current && isActive) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }

    // Apply emotion-based morphs
    if (scene && isActive) {
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const emotionMap = {
            happy: { smile: 0.8, eyeOpen: 1.0 },
            sad: { mouthFrown: 0.6, eyeOpen: 0.5 },
            angry: { browDown: 0.7, mouthFrown: 0.5 },
            surprised: { eyeOpen: 1.0, mouthOpen: 0.6 },
            neutral: { smile: 0.2, eyeOpen: 0.8 }
          };

          const targets = emotionMap[currentEmotion] || emotionMap.neutral;

          Object.entries(targets).forEach(([name, value]) => {
            const index = child.morphTargetDictionary?.[name];
            if (index !== undefined) {
              child.morphTargetInfluences[index] = value;
            }
          });
        }
      });
    }
  });

  return (
    <primitive 
      ref={modelRef} 
      object={scene} 
      position={[0, 0, 0]} 
      scale={1}
      visible={isActive}
    />
  );
}

function SingleAvatar({ activeAvatar, isAnimating, currentEmotion, spokenText }) {
  const [loadingStatus, setLoadingStatus] = useState({ sarah: true, daisy: true, john: true });

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setLoadingStatus({ sarah: false, daisy: false, john: false });
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const isLoading = Object.values(loadingStatus).some(status => status);

  return (
    <div className="avatar-container">
      {isLoading && (
        <div className="avatar-loading">
          <div className="loading-spinner"></div>
          <p>Loading avatars...</p>
        </div>
      )}
      
      <Canvas shadows camera={{ position: [1, 1.90, 0.7], fov: 65 }}>
        <PerspectiveCamera makeDefault position={[0, 1.0, 0]} />
            
        <OrbitControls
          enableZoom={true}
          enablePan={false}
          target={[0, 1.55, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 1.90}
          autoRotate={false}
        />
        
        {/* Professional Lighting */}
        <ambientLight intensity={1.50} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-5, 3, -3]} intensity={0.6} color="#ffffff" />
        <pointLight position={[5, 3, 3]} intensity={0.4} color="#f0f0ff" />
        <spotLight
          position={[0, 10, 0]}
          angle={0.4}
          penumbra={1}
          intensity={0.5}
          castShadow
        />

        {/* Load all three avatars */}
        <AvatarModel
          avatarKey="sarah"
          isActive={activeAvatar === 'sarah'}
          isAnimating={isAnimating}
          currentEmotion={currentEmotion}
          spokenText={spokenText}
        />
        <AvatarModel
          avatarKey="daisy"
          isActive={activeAvatar === 'daisy'}
          isAnimating={isAnimating}
          currentEmotion={currentEmotion}
          spokenText={spokenText}
        />
        <AvatarModel
          avatarKey="john"
          isActive={activeAvatar === 'john'}
          isAnimating={isAnimating}
          currentEmotion={currentEmotion}
          spokenText={spokenText}
        />
      </Canvas>
    </div>
  );
}

// Preload all avatar models
useGLTF.preload('/models/sarah-avatar.glb');
useGLTF.preload('/models/daisy-avatar.glb');
useGLTF.preload('/models/john-avatar.glb');

export default SingleAvatar;
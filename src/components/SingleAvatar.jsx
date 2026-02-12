import { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Individual Avatar Model Component with Facial Expressions
function AvatarModel({ avatarKey, isActive, isAnimating, currentEmotion, spokenText }) {
  const modelRef = useRef();
  const mixerRef = useRef();
  const clockRef = useRef(new THREE.Clock());
  const [mouthOpenAmount, setMouthOpenAmount] = useState(0);
  const [isSmiling, setIsSmiling] = useState(true);
  const morphMeshesRef = useRef([]); // ✅ Store ALL meshes with morph targets
  const blinkTimerRef = useRef(0);
  const lastAnimatingStateRef = useRef(isAnimating); // ✅ Track previous state

  const avatarPaths = {
    sarah: '/models/sarah-avatar.glb',
    daisy: '/models/daisy-avatar.glb',
    john: '/models/john-avatar.glb'
  };

  const { scene, animations } = useGLTF(avatarPaths[avatarKey]);

  // ✅ Find ALL meshes with morph targets (your avatars have 6 meshes each!)
  useEffect(() => {
    if (scene) {
      const meshesWithMorphs = [];
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetDictionary && child.morphTargetInfluences) {
          meshesWithMorphs.push(child);
          console.log(`✓ Found morph targets for ${avatarKey}:`, Object.keys(child.morphTargetDictionary).length, 'shapes');
          console.log(`✓ Morph target names for ${avatarKey}:`, Object.keys(child.morphTargetDictionary));
        }
      });
      morphMeshesRef.current = meshesWithMorphs;
      console.log(`✅ Total meshes with morphs for ${avatarKey}:`, meshesWithMorphs.length);
    }
  }, [scene, avatarKey]);

  // Animation mixer setup
  useEffect(() => {
    if (scene && animations && animations.length > 0) {
      const mixer = new THREE.AnimationMixer(scene);
      mixerRef.current = mixer;

      animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        action.play();
      });
    }

    if (scene) {
      scene.visible = isActive;
    }

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
      }
    };
  }, [scene, animations, isActive]);

  // Smile before and after speaking
  useEffect(() => {
    if (isAnimating) {
      setIsSmiling(true);
      setTimeout(() => {
        setIsSmiling(false);
      }, 800);
    } else {
      setTimeout(() => {
        setIsSmiling(true);
      }, 300);
    }
  }, [isAnimating]);

  // ✅ Helper function to safely set morph target influence on ALL meshes
  const setMorphTarget = (name, value, lerpSpeed = 0.2) => {
    morphMeshesRef.current.forEach(mesh => {
      const dict = mesh.morphTargetDictionary;
      const influences = mesh.morphTargetInfluences;
      
      // Try the original name first (lowercase for Sarah/Daisy)
      if (name in dict) {
        const currentValue = influences[dict[name]];
        influences[dict[name]] = THREE.MathUtils.lerp(currentValue, value, lerpSpeed);
        return;
      }
      
      // John's avatar uses PascalCase - try capitalizing first letter
      if (avatarKey === 'john') {
        const capitalizedName = name.charAt(0).toUpperCase() + name.slice(1);
        if (capitalizedName in dict) {
          const currentValue = influences[dict[capitalizedName]];
          influences[dict[capitalizedName]] = THREE.MathUtils.lerp(currentValue, value, lerpSpeed);
          return;
        }
      }
      
      // Try all variations for John
      if (avatarKey === 'john') {
        // Try common variations
        const variations = [
          name.toUpperCase(), // ALL CAPS
          name.toLowerCase(), // all lowercase
          name.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, ''), // snake_case
          name.replace(/_/g, ''), // remove underscores
        ];
        
        for (const variant of variations) {
          if (variant in dict) {
            const currentValue = influences[dict[variant]];
            influences[dict[variant]] = THREE.MathUtils.lerp(currentValue, value, lerpSpeed);
            return;
          }
        }
      }
    });
  };

  // ✅ Helper function to reset a morph target on ALL meshes
  const resetMorphTarget = (name, lerpSpeed = 0.15) => {
    setMorphTarget(name, 0, lerpSpeed);
  };

  // Animation loop - facial expressions and lip sync
  useFrame(() => {
    if (mixerRef.current && isActive) {
      const delta = clockRef.current.getDelta();
      mixerRef.current.update(delta);
    }

    if (morphMeshesRef.current.length === 0 || !isActive) return;

    const time = clockRef.current.getElapsedTime();

    // ✅ CRITICAL FIX: Reset blink timer when transitioning from speaking to idle
    if (lastAnimatingStateRef.current && !isAnimating) {
      // Just stopped speaking - reset blink timer to prevent immediate blink
      blinkTimerRef.current = 0;
      // Force eyes fully open immediately
      morphMeshesRef.current.forEach(mesh => {
        const dict = mesh.morphTargetDictionary;
        const influences = mesh.morphTargetInfluences;
        // Try different name variations for John
        const eyeBlinkVariations = avatarKey === 'john' 
          ? ['eyeBlinkLeft', 'EyeBlinkLeft', 'eyeblinkleft', 'EYEBLINKLEFT']
          : ['eyeBlinkLeft'];
        const eyeBlinkRightVariations = avatarKey === 'john'
          ? ['eyeBlinkRight', 'EyeBlinkRight', 'eyeblinkright', 'EYEBLINKRIGHT']
          : ['eyeBlinkRight'];
        
        eyeBlinkVariations.forEach(name => {
          if (name in dict) influences[dict[name]] = 0;
        });
        eyeBlinkRightVariations.forEach(name => {
          if (name in dict) influences[dict[name]] = 0;
        });
        
        if ('eyesClosed' in dict) influences[dict['eyesClosed']] = 0;
        if ('EyesClosed' in dict) influences[dict['EyesClosed']] = 0;
        if ('eyeSquintLeft' in dict) influences[dict['eyeSquintLeft']] = 0;
        if ('EyeSquintLeft' in dict) influences[dict['EyeSquintLeft']] = 0;
        if ('eyeSquintRight' in dict) influences[dict['eyeSquintRight']] = 0;
        if ('EyeSquintRight' in dict) influences[dict['EyeSquintRight']] = 0;
      });
    }
    lastAnimatingStateRef.current = isAnimating;

    // ========== LIP SYNC - Advanced mouth movement when speaking ==========
    if (isAnimating && spokenText) {
      // Create natural speech rhythm
      const speechCycle = Math.sin(time * 11) * 0.5 + 0.5;
      const speechVariation = Math.sin(time * 7.3) * 0.3;
      const targetMouth = (speechCycle + speechVariation) * 0.7;
      
      setMouthOpenAmount(prev => THREE.MathUtils.lerp(prev, targetMouth, 0.35));

      // Primary mouth shapes for speech
      setMorphTarget('jawOpen', mouthOpenAmount * 0.8, 0.3);
      setMorphTarget('mouthOpen', mouthOpenAmount * 0.6, 0.3);
      
      // Viseme cycling for realistic speech
      const visemes = [
        'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
        'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 'viseme_kk',
        'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR'
      ];
      
      const visemeSpeed = 8;
      const currentVisemeIndex = Math.floor(time * visemeSpeed) % visemes.length;
      
      visemes.forEach((viseme, index) => {
        if (index === currentVisemeIndex) {
          setMorphTarget(viseme, mouthOpenAmount * 0.6, 0.25);
        } else {
          resetMorphTarget(viseme, 0.25);
        }
      });

      // Subtle mouth movement
      setMorphTarget('mouthLeft', Math.sin(time * 5) * 0.1, 0.2);
      setMorphTarget('mouthRight', Math.sin(time * 5.3) * 0.1, 0.2);
      
      // Jaw movement
      setMorphTarget('jawForward', Math.sin(time * 4) * 0.15, 0.2);
      setMorphTarget('jawLeft', Math.sin(time * 3.7) * 0.08, 0.2);
      setMorphTarget('jawRight', Math.sin(time * 4.1) * 0.08, 0.2);

      // Add slight cheek movement
      setMorphTarget('cheekPuff', Math.sin(time * 6) * 0.1, 0.2);
      
      // Subtle head movement while speaking
      if (modelRef.current) {
        modelRef.current.rotation.y = Math.sin(time * 2) * 0.03;
        modelRef.current.rotation.x = Math.sin(time * 1.5) * 0.02;
        modelRef.current.position.y = Math.sin(time * 3) * 0.005;
      }

    } else {
      // Reset speech-related morphs when not speaking
      setMouthOpenAmount(prev => THREE.MathUtils.lerp(prev, 0, 0.15));
      
      const speechMorphs = [
        'jawOpen', 'mouthOpen', 'jawForward', 'jawLeft', 'jawRight',
        'mouthLeft', 'mouthRight', 'cheekPuff',
        'viseme_aa', 'viseme_E', 'viseme_I', 'viseme_O', 'viseme_U',
        'viseme_PP', 'viseme_FF', 'viseme_TH', 'viseme_DD', 'viseme_kk',
        'viseme_CH', 'viseme_SS', 'viseme_nn', 'viseme_RR', 'viseme_sil'
      ];
      
      speechMorphs.forEach(morph => resetMorphTarget(morph, 0.15));
    }

    // ========== SMILE - Natural smiling expression ==========
    if (isSmiling && !isAnimating) {
      setMorphTarget('mouthSmile', 0.7, 0.12);
      setMorphTarget('mouthSmileLeft', 0.65, 0.12);
      setMorphTarget('mouthSmileRight', 0.65, 0.12);
      setMorphTarget('cheekSquintLeft', 0.35, 0.12);
      setMorphTarget('cheekSquintRight', 0.35, 0.12);
      setMorphTarget('mouthDimpleLeft', 0.2, 0.12);
      setMorphTarget('mouthDimpleRight', 0.2, 0.12);
    } else if (!isAnimating) {
      setMorphTarget('mouthSmile', 0.2, 0.1);
      setMorphTarget('mouthSmileLeft', 0.15, 0.1);
      setMorphTarget('mouthSmileRight', 0.15, 0.1);
      resetMorphTarget('cheekSquintLeft', 0.1);
      resetMorphTarget('cheekSquintRight', 0.1);
    }

    // ========== REALISTIC BLINKING (NOT while speaking) ==========
    if (!isAnimating) {
      blinkTimerRef.current += clockRef.current.getDelta();
      
      // ✅ Wait at least 2 seconds after stopping speaking before first blink
      const nextBlinkTime = 3 + Math.random() * 3;
      if (blinkTimerRef.current > nextBlinkTime) {
        blinkTimerRef.current = 0;
      }
      
      const blinkProgress = blinkTimerRef.current;
      
      // ✅ Only blink if enough time has passed (prevents immediate blink on idle)
      if (blinkProgress > 2 && blinkProgress < 2.15) {
        // Blink close phase (0.15 seconds)
        const blinkAmount = Math.min((blinkProgress - 2) / 0.075, 1);
        setMorphTarget('eyeBlinkLeft', blinkAmount, 0.9);
        setMorphTarget('eyeBlinkRight', blinkAmount, 0.9);
        setMorphTarget('eyesClosed', blinkAmount * 0.8, 0.9);
      } else if (blinkProgress >= 2.15 && blinkProgress < 2.3) {
        // Blink open phase (0.15 seconds)
        const openAmount = 1 - Math.min((blinkProgress - 2.15) / 0.15, 1);
        setMorphTarget('eyeBlinkLeft', openAmount, 0.9);
        setMorphTarget('eyeBlinkRight', openAmount, 0.9);
        setMorphTarget('eyesClosed', openAmount * 0.8, 0.9);
      } else {
        // Eyes fully open - force to 0 aggressively
        setMorphTarget('eyeBlinkLeft', 0, 0.9);
        setMorphTarget('eyeBlinkRight', 0, 0.9);
        setMorphTarget('eyesClosed', 0, 0.9);
        setMorphTarget('eyeSquintLeft', 0, 0.9);
        setMorphTarget('eyeSquintRight', 0, 0.9);
      }
    } else {
      // Force eyes WIDE OPEN while speaking - no blinking allowed!
      setMorphTarget('eyeBlinkLeft', 0, 0.9);
      setMorphTarget('eyeBlinkRight', 0, 0.9);
      setMorphTarget('eyesClosed', 0, 0.9);
      setMorphTarget('eyeSquintLeft', 0, 0.9);
      setMorphTarget('eyeSquintRight', 0, 0.9);
      blinkTimerRef.current = 0; // Reset timer completely
    }

    // ========== SUBTLE EYE MOVEMENT ==========
    if (!isAnimating) {
      const eyeDriftX = Math.sin(time * 0.5) * 0.15;
      const eyeDriftY = Math.sin(time * 0.3) * 0.1;
      
      setMorphTarget('eyeLookInLeft', Math.max(-eyeDriftX, 0), 0.1);
      setMorphTarget('eyeLookOutLeft', Math.max(eyeDriftX, 0), 0.1);
      setMorphTarget('eyeLookInRight', Math.max(eyeDriftX, 0), 0.1);
      setMorphTarget('eyeLookOutRight', Math.max(-eyeDriftX, 0), 0.1);
      
      setMorphTarget('eyeLookUpLeft', Math.max(eyeDriftY, 0), 0.1);
      setMorphTarget('eyeLookDownLeft', Math.max(-eyeDriftY, 0), 0.1);
      setMorphTarget('eyeLookUpRight', Math.max(eyeDriftY, 0), 0.1);
      setMorphTarget('eyeLookDownRight', Math.max(-eyeDriftY, 0), 0.1);
      
      if (Math.abs(eyeDriftY) > 0.05) {
        setMorphTarget('eyesLookUp', Math.max(eyeDriftY, 0), 0.1);
        setMorphTarget('eyesLookDown', Math.max(-eyeDriftY, 0), 0.1);
      }
    }

    // ========== EMOTION EXPRESSIONS (but keep eyes open when speaking) ==========
    if (currentEmotion === 'happy') {
      setMorphTarget('browInnerUp', 0.3, 0.08);
      setMorphTarget('browOuterUpLeft', 0.2, 0.08);
      setMorphTarget('browOuterUpRight', 0.2, 0.08);
      resetMorphTarget('browDownLeft', 0.08);
      resetMorphTarget('browDownRight', 0.08);
      
    } else if (currentEmotion === 'sad') {
      setMorphTarget('browInnerUp', 0.6, 0.08);
      setMorphTarget('browDownLeft', 0.3, 0.08);
      setMorphTarget('browDownRight', 0.3, 0.08);
      setMorphTarget('mouthFrownLeft', 0.5, 0.08);
      setMorphTarget('mouthFrownRight', 0.5, 0.08);
      setMorphTarget('mouthLowerDownLeft', 0.3, 0.08);
      setMorphTarget('mouthLowerDownRight', 0.3, 0.08);
      resetMorphTarget('mouthSmile', 0.08);
      
    } else if (currentEmotion === 'surprised') {
      setMorphTarget('eyeWideLeft', 0.9, 0.08);
      setMorphTarget('eyeWideRight', 0.9, 0.08);
      setMorphTarget('browOuterUpLeft', 0.8, 0.08);
      setMorphTarget('browOuterUpRight', 0.8, 0.08);
      setMorphTarget('browInnerUp', 0.7, 0.08);
      // Don't override mouth when speaking
      if (!isAnimating) {
        setMorphTarget('jawOpen', 0.5, 0.08);
        setMorphTarget('mouthOpen', 0.4, 0.08);
      }
      
    } else if (currentEmotion === 'angry') {
      setMorphTarget('browDownLeft', 0.7, 0.08);
      setMorphTarget('browDownRight', 0.7, 0.08);
      // Keep eyes open - removed eyeSquint completely to prevent closing
      setMorphTarget('noseSneerLeft', 0.4, 0.08);
      setMorphTarget('noseSneerRight', 0.4, 0.08);
      setMorphTarget('mouthPressLeft', 0.3, 0.08);
      setMorphTarget('mouthPressRight', 0.3, 0.08);
      
    } else if (currentEmotion === 'neutral') {
      resetMorphTarget('browInnerUp', 0.08);
      resetMorphTarget('browDownLeft', 0.08);
      resetMorphTarget('browDownRight', 0.08);
      setMorphTarget('mouthSmile', 0.15, 0.08);
    }

    // ========== FORCE EYES OPEN - Override any closing morphs ==========
    // This runs AFTER emotions to ensure eyes never close except during controlled blinks
    if (!isAnimating) {
      const blinkProgress = blinkTimerRef.current;
      // Only allow blinking during the specific blink window (2.0 to 2.3 seconds after timer reset)
      if (blinkProgress < 2 || blinkProgress >= 2.3) {
        // Force all eye-closing morphs to 0 when not actively blinking
        setMorphTarget('eyeBlinkLeft', 0, 0.9);
        setMorphTarget('eyeBlinkRight', 0, 0.9);
        setMorphTarget('eyesClosed', 0, 0.9);
        setMorphTarget('eyeSquintLeft', 0, 0.9);
        setMorphTarget('eyeSquintRight', 0, 0.9);
      }
    }

    // ========== SUBTLE BREATHING ANIMATION ==========
    const breathingCycle = Math.sin(time * 0.8) * 0.5 + 0.5;
    if (modelRef.current && !isAnimating) {
      modelRef.current.position.y = breathingCycle * 0.008;
      modelRef.current.rotation.x = breathingCycle * 0.005;
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

useGLTF.preload('/models/sarah-avatar.glb');
useGLTF.preload('/models/daisy-avatar.glb');
useGLTF.preload('/models/john-avatar.glb');

export default SingleAvatar;
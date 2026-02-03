import { motion } from 'framer-motion'

export default function LoadingSpinner({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <motion.div
          className="relative w-16 h-16 mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full border-4 border-ice-500/30"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-ice-500 shadow-glow-blue"></div>
          <div className="absolute inset-2 rounded-full bg-ice-500/20 flex items-center justify-center">
            <span className="text-2xl">🏒</span>
          </div>
        </motion.div>
        <motion.p
          className="text-ice-200 font-medium"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>
      </div>
    </div>
  )
}

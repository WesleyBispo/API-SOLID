import type { Environment } from 'vitest/environments'

export default <Environment>{
  name: 'custom',
  transformMode: 'ssr',
  // optional - only if you support "experimental-vm" pool
  async setupVM() {
    const vm = await import('node:vm')
    const context = vm.createContext()
    return {
      getVmContext() {
        return context
      },
      teardown() {
        // called after all tests with this env have been run
      },
    }
  },
  async setup() {
    console.log('Setup environment')
    // custom setup
    return {
      async teardown() {
        console.log('Teardown environment')
        // called after all tests with this env have been run
      },
    }
  },
}
